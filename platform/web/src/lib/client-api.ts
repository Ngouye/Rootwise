/**
 * Appels à l'API depuis le navigateur, via le proxy /api du site (même origine).
 * Les jetons de session sont dans des cookies httpOnly : ce code ne les voit jamais.
 */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

type Options = { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown };

/** Routes pour lesquelles un 401 ne doit pas déclencher de rafraîchissement de session. */
const NO_REFRESH = new Set(["/auth/login", "/auth/refresh", "/auth/logout"]);

export async function apiFetch<T = void>(path: string, options: Options = {}): Promise<T> {
  return send<T>(path, options, true);
}

/** Envoi d'un formulaire multipart (fichier) ; même gestion de session et de CSRF que {@link apiFetch}. */
export async function apiUpload<T>(path: string, form: FormData, retry = true): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: "POST",
    headers: { Accept: "application/json", "X-XSRF-TOKEN": await csrfToken() },
    body: form,
    credentials: "same-origin",
  });
  if (retry && response.status === 401 && (await refreshSession())) return apiUpload<T>(path, form, false);
  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as T;
}

/** Échange le jeton de rafraîchissement contre une nouvelle session ; false si elle a expiré. */
export async function refreshSession(): Promise<boolean> {
  const response = await fetch("/api/auth/refresh", { method: "POST", credentials: "same-origin" });
  return response.ok;
}

async function send<T>(path: string, { method = "GET", body }: Options, retry: boolean): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") headers["X-XSRF-TOKEN"] = await csrfToken();

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });

  if (retry && response.status === 401 && !NO_REFRESH.has(path) && (await refreshSession())) {
    return send<T>(path, { method, body }, false);
  }
  const error = response.ok ? null : await toApiError(response);
  if (retry && error?.code === "CSRF_INVALID") {
    document.cookie = "XSRF-TOKEN=; Max-Age=0; Path=/";
    return send<T>(path, { method, body }, false);
  }
  if (error) throw error;

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Jeton CSRF (double soumission) : cookie XSRF-TOKEN posé par l'API, renvoyé en en-tête. */
async function csrfToken(): Promise<string> {
  let token = readCookie("XSRF-TOKEN");
  if (!token) {
    await fetch("/api/auth/csrf", { credentials: "same-origin" });
    token = readCookie("XSRF-TOKEN");
  }
  return token ?? "";
}

function readCookie(name: string): string | undefined {
  const entry = document.cookie.split("; ").find((cookie) => cookie.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : undefined;
}

async function toApiError(response: Response): Promise<ApiError> {
  try {
    const problem = (await response.json()) as { code?: string; detail?: string; errors?: Record<string, string> };
    return new ApiError(
      response.status,
      problem.code ?? "UNKNOWN",
      problem.detail ?? "Une erreur est survenue.",
      problem.errors ?? {},
    );
  } catch {
    return new ApiError(response.status, "UNKNOWN", "Le service est momentanément indisponible.");
  }
}
