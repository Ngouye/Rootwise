/**
 * Session HTTP auprès de l'API de la plateforme, comme le ferait le navigateur : cookies de
 * session, jeton CSRF (double soumission) et reconnexion si le jeton d'accès (15 min) expire.
 * Partagée par import.mjs et exporter.mjs.
 */

export class ApiError extends Error {
  constructor(status, code, detail) {
    super(`${status} ${code} : ${detail}`);
    this.status = status;
    this.code = code;
  }
}

export function createSession({ api, email, password }) {
  const base = api.replace(/\/$/, "");
  const jar = new Map();

  function remember(response) {
    for (const header of response.headers.getSetCookie()) {
      const [pair, ...attributes] = header.split(";");
      const index = pair.indexOf("=");
      const name = pair.slice(0, index).trim();
      const expired = attributes.some((attribute) => /^\s*max-age=0\s*$/i.test(attribute));
      if (expired) jar.delete(name);
      else jar.set(name, pair.slice(index + 1).trim());
    }
  }

  function headers() {
    const result = { cookie: [...jar].map(([name, value]) => `${name}=${value}`).join("; ") };
    if (jar.has("XSRF-TOKEN")) result["X-XSRF-TOKEN"] = decodeURIComponent(jar.get("XSRF-TOKEN"));
    return result;
  }

  /** Requête JSON (ou multipart avec un FormData) vers /api ; renvoie le corps décodé. */
  async function call(method, path, body, { retry = true } = {}) {
    const requestHeaders = headers();
    let payload = body;
    if (body !== undefined && !(body instanceof FormData)) {
      requestHeaders["content-type"] = "application/json";
      payload = JSON.stringify(body);
    }
    const response = await fetch(`${base}/api${path}`, { method, headers: requestHeaders, body: payload });
    remember(response);
    if (response.status === 401 && retry && path !== "/auth/login") {
      await login(); // jeton d'accès expiré pendant une longue opération
      return call(method, path, body, { retry: false });
    }
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) throw new ApiError(response.status, data?.code ?? "HTTP", data?.detail ?? text);
    return data;
  }

  /** Fichier binaire (média d'une leçon, image publique) avec le nom annoncé par le serveur. */
  async function download(path) {
    const response = await fetch(`${base}/api${path}`, { headers: headers() });
    if (!response.ok) throw new ApiError(response.status, "HTTP", `${path} : téléchargement impossible`);
    const disposition = response.headers.get("content-disposition") ?? "";
    const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition)?.[1];
    const plain = /filename="?([^";]+)"?/i.exec(disposition)?.[1];
    return {
      name: encoded ? decodeURIComponent(encoded) : plain ?? null,
      type: response.headers.get("content-type"),
      buffer: Buffer.from(await response.arrayBuffer()),
    };
  }

  async function login() {
    if (!email || !password) throw new Error("Définissez ADMIN_EMAIL et ADMIN_PASSWORD (compte administrateur).");
    await call("GET", "/auth/csrf");
    const me = await call("POST", "/auth/login", { email, password }, { retry: false });
    if (!me.roles.includes("ADMIN")) throw new Error(`${email} n'est pas administrateur.`);
    await call("GET", "/auth/csrf"); // nouveau jeton CSRF lié à la session
    return me;
  }

  return { call, download, login };
}
