"""Servicio interno de recorte de fotos de cervezas (solo accesible desde la red de Docker).

POST /cutout?mode=cutout|resize  (cuerpo: la imagen tal cual)
  - cutout: quita el fondo con rembg, recorta el borde transparente y reduce a 640 px.
  - resize: no quita el fondo; solo reduce (para fotos que ya vienen bien o cuando el recorte falla).
Devuelve un WebP.
"""
import io
import os

from fastapi import FastAPI, HTTPException, Request, Response
from PIL import Image, ImageOps

MAX_SIDE = 640
MAX_INPUT_BYTES = 15 * 1024 * 1024
MODEL = os.environ.get("REMBG_MODEL", "isnet-general-use")

app = FastAPI(title="unibeerse-cutout")
_session = None


def session():
    # Se crea la primera vez que se usa (el modelo ya viene descargado en la imagen)
    global _session
    if _session is None:
        from rembg import new_session

        _session = new_session(MODEL)
    return _session


def load(data: bytes) -> Image.Image:
    try:
        img = Image.open(io.BytesIO(data))
        img = ImageOps.exif_transpose(img)  # fotos de movil giradas
        img.load()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=415, detail="No es una imagen valida") from exc
    # Limita el tamano antes de procesar: una foto de 48 MP no aporta nada y tarda mucho
    img.thumbnail((1600, 1600))
    return img.convert("RGBA")


def crop_to_content(img: Image.Image, padding: int = 6) -> Image.Image:
    alpha = img.getchannel("A").point(lambda a: 255 if a > 12 else 0)
    box = alpha.getbbox()
    if not box:
        return img
    left, top, right, bottom = box
    return img.crop((max(0, left - padding), max(0, top - padding), min(img.width, right + padding), min(img.height, bottom + padding)))


def to_webp(img: Image.Image) -> bytes:
    img.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    out = io.BytesIO()
    img.save(out, "WEBP", quality=82, method=6)
    return out.getvalue()


def cutout(img: Image.Image) -> Image.Image:
    from rembg import remove

    result = remove(img, session=session(), post_process_mask=True)
    return crop_to_content(result.convert("RGBA"))


def process(data: bytes, mode: str) -> bytes:
    img = load(data)
    if mode == "resize":
        # Sin quitar el fondo: se pasa a RGB para no arrastrar transparencias raras
        return to_webp(img.convert("RGB").convert("RGBA"))
    return to_webp(cutout(img))


def preview(data: bytes) -> bytes:
    """Para ensenarle al bot como queda: la foto (con transparencia) sobre el fondo claro de la web, en JPEG."""
    img = load(data)
    pad = 48
    canvas = Image.new("RGB", (img.width + pad * 2, img.height + pad * 2), (228, 235, 232))
    canvas.paste(img, (pad, pad), img)
    canvas.thumbnail((900, 900), Image.LANCZOS)
    out = io.BytesIO()
    canvas.save(out, "JPEG", quality=88)
    return out.getvalue()


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/cutout")
async def cutout_endpoint(request: Request, mode: str = "cutout"):
    if mode not in ("cutout", "resize"):
        raise HTTPException(status_code=400, detail="mode debe ser cutout o resize")
    data = await request.body()
    if not data or len(data) > MAX_INPUT_BYTES:
        raise HTTPException(status_code=413, detail="Imagen vacia o demasiado grande (max 15 MB)")
    return Response(content=process(data, mode), media_type="image/webp")


@app.post("/preview")
async def preview_endpoint(request: Request):
    data = await request.body()
    if not data or len(data) > MAX_INPUT_BYTES:
        raise HTTPException(status_code=413, detail="Imagen vacia o demasiado grande")
    return Response(content=preview(data), media_type="image/jpeg")
