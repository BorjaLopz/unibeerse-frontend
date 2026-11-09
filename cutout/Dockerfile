FROM python:3.12-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1 OMP_NUM_THREADS=2 U2NET_HOME=/models
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Descarga el modelo al construir la imagen: luego no hace falta internet para recortar
RUN python -c "from rembg import new_session; new_session('isnet-general-use')"
COPY app.py .
RUN useradd -u 10002 -m cutout && chown -R cutout /models
USER cutout
EXPOSE 8000
# Un solo proceso: el modelo ocupa ~1 GB y las fotos llegan de una en una
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
