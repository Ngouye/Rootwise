import { NextResponse, type NextRequest } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

/**
 * Le JWT d'accès vit 15 minutes : quand son cookie a expiré mais que le jeton de
 * rafraîchissement est encore là, on renouvelle la session avant le rendu de la page.
 * Les nouveaux cookies partent vers le navigateur et servent aussi au rendu en cours.
 */
export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;
  if (request.cookies.has("access_token") || !refreshToken) {
    return NextResponse.next();
  }

  let refreshed: Response;
  try {
    refreshed = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { cookie: `refresh_token=${refreshToken}` },
      // Le renouvellement écrit en base (Supabase, à distance) : un réseau lent ne doit pas déconnecter.
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    return NextResponse.next();
  }

  const setCookies = refreshed.headers.getSetCookie();
  const jar = new Map(request.cookies.getAll().map((cookie) => [cookie.name, cookie.value]));
  for (const header of setCookies) {
    const [pair] = header.split(";");
    const separator = pair.indexOf("=");
    const name = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1);
    if (!value || /max-age=0/i.test(header)) jar.delete(name);
    else jar.set(name, value);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("cookie", [...jar].map(([name, value]) => `${name}=${value}`).join("; "));
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const header of setCookies) response.headers.append("set-cookie", header);
  return response;
}

export const config = {
  // Pages uniquement : ni l'API relayée, ni le parcours OAuth, ni les fichiers statiques.
  matcher: ["/((?!api/|oauth2/|login/oauth2/|_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
