export interface Beer {
  id: number;
  brand: string;
  name: string;
  style: string;
  abv: number | null;
  country: string;
  score: number | null;
  notes: string;
  image: string | null;
  thumb: string | null;
}

export interface BeerInput {
  brand: string;
  name: string;
  style: string;
  abv: number | null;
  country: string;
  score: number | null;
  notes: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Lo que el bot necesita de la API de Unibeerse (/api/bot/beers). */
export interface BeerClient {
  search(q: string): Promise<Beer[]>;
  /** what = image (sin foto) o score (sin nota) */
  missing(what: "image" | "score"): Promise<Beer[]>;
  get(id: number): Promise<Beer>;
  create(input: BeerInput): Promise<Beer>;
  setScore(id: number, score: number | null): Promise<Beer>;
  setImage(id: number, webp: Buffer): Promise<Beer>;
}

/** Procesado de fotos (servicio unibeerse-cutout). */
export interface ImageProcessor {
  /** mode cutout = quita el fondo; resize = solo reduce. Devuelve un WebP. */
  process(image: Buffer, mode: "cutout" | "resize"): Promise<Buffer>;
  /** JPEG para ensenar el resultado sobre el fondo de la web. */
  preview(webp: Buffer): Promise<Buffer>;
}

async function fail(res: Response): Promise<never> {
  let message = `HTTP ${res.status}`;
  try {
    const body = (await res.json()) as { message?: string; detail?: string };
    message = body.message ?? body.detail ?? message;
  } catch {
    /* sin JSON */
  }
  throw new ApiError(res.status, message);
}

export class HttpBeerApi implements BeerClient {
  constructor(
    private readonly base: string,
    private readonly key: string,
  ) {}

  private async call<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.base}/api/bot/beers${path}`, {
      ...init,
      headers: { "X-Bot-Key": this.key, ...(init.headers ?? {}) },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return fail(res);
    return (await res.json()) as T;
  }

  search = (q: string) => this.call<Beer[]>(`/search?q=${encodeURIComponent(q)}`);
  missing = (what: "image" | "score") => this.call<Beer[]>(`/missing?what=${what}`);
  get = (id: number) => this.call<Beer>(`/${id}`);
  create = (input: BeerInput) =>
    this.call<Beer>("", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  setScore = (id: number, score: number | null) =>
    this.call<Beer>(`/${id}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score }),
    });
  setImage = (id: number, webp: Buffer) => {
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(webp)], { type: "image/webp" }), "foto.webp");
    return this.call<Beer>(`/${id}/image`, { method: "POST", body: form });
  };
}

export class HttpImageProcessor implements ImageProcessor {
  constructor(private readonly base: string) {}

  private async post(path: string, body: Buffer): Promise<Buffer> {
    const res = await fetch(`${this.base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: new Uint8Array(body),
      signal: AbortSignal.timeout(180_000), // el primer recorte carga el modelo: puede tardar
    });
    if (!res.ok) return fail(res);
    return Buffer.from(await res.arrayBuffer());
  }

  process = (image: Buffer, mode: "cutout" | "resize") => this.post(`/cutout?mode=${mode}`, image);
  preview = (webp: Buffer) => this.post("/preview", webp);
}
