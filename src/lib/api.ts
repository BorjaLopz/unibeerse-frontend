import { getToken } from "./firebase";
import type { Beer, BeerComment, BeerInput } from "../types";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(
  path: string,
  opts: { method?: string; body?: unknown; form?: FormData; auth?: boolean | "optional"; cache?: RequestCache } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    else if (opts.auth === true) throw new ApiError(401, "Inicia sesión para continuar");
  }
  let body: BodyInit | undefined;
  if (opts.form) {
    body = opts.form;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  let res: Response;
  try {
    res = await fetch(path, { method: opts.method ?? "GET", headers, body, cache: opts.cache });
  } catch {
    throw new ApiError(0, "No hay conexión con el servidor. Prueba de nuevo en un momento.");
  }
  if (!res.ok) {
    let message = "";
    try {
      message = ((await res.json()) as { message?: string }).message ?? "";
    } catch {
      /* respuesta sin JSON */
    }
    throw new ApiError(res.status, message || friendly(res.status));
  }
  if (res.status === 204 || res.status === 202) return undefined as T;
  return (await res.json()) as T;
}

function friendly(status: number): string {
  if (status === 401) return "Tu sesión ha caducado. Vuelve a entrar.";
  if (status === 403) return "No tienes permiso para hacer esto.";
  if (status === 404) return "No se ha encontrado lo que buscas.";
  if (status === 429) return "Demasiados intentos. Prueba más tarde.";
  return "Algo ha fallado en el servidor. Prueba de nuevo.";
}

export const api = {
  /** fresh=true se salta la caché del navegador (la API cachea la lista 60 s): úsalo tras guardar cambios. */
  beers: (fresh = false) => request<Beer[]>("/api/beers", { cache: fresh ? "reload" : undefined }),
  me: () => request<{ admin: boolean }>("/api/me", { auth: true }),

  comments: (beerId: number) =>
    request<BeerComment[]>(`/api/beers/${beerId}/comments`, { auth: "optional" }),
  addComment: (beerId: number, text: string) =>
    request<BeerComment>(`/api/beers/${beerId}/comments`, { method: "POST", body: { text }, auth: true }),
  deleteComment: (id: number) => request<void>(`/api/comments/${id}`, { method: "DELETE", auth: true }),

  contact: (data: {
    kind: "contact" | "issue";
    beerId: number | null;
    name: string;
    email: string;
    message: string;
    website: string;
  }) => request<void>("/api/contact", { method: "POST", body: data }),

  createBeer: (b: BeerInput) => request<Beer>("/api/admin/beers", { method: "POST", body: b, auth: true }),
  updateBeer: (id: number, b: BeerInput) =>
    request<Beer>(`/api/admin/beers/${id}`, { method: "PUT", body: b, auth: true }),
  deleteBeer: (id: number) => request<void>(`/api/admin/beers/${id}`, { method: "DELETE", auth: true }),
  uploadImage: (id: number, file: Blob) => {
    const form = new FormData();
    form.append("file", file, "foto.webp");
    return request<Beer>(`/api/admin/beers/${id}/image`, { method: "POST", form, auth: true });
  },
};
