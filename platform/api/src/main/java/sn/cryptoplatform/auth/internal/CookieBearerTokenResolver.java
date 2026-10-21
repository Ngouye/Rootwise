package sn.cryptoplatform.auth.internal;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;

/**
 * JWT lu dans l'en-tête Authorization (clients d'API) ou, pour le navigateur, dans le cookie
 * httpOnly. Le cookie est ignoré sur les routes publiques et d'authentification : un jeton
 * périmé ne doit pas empêcher de se connecter ou de rafraîchir la session.
 */
class CookieBearerTokenResolver implements BearerTokenResolver {

	private final DefaultBearerTokenResolver headerResolver = new DefaultBearerTokenResolver();

	@Override
	public String resolve(HttpServletRequest request) {
		String fromHeader = headerResolver.resolve(request);
		if (fromHeader != null) {
			return fromHeader;
		}
		return usesCookieAuthentication(request.getRequestURI())
				? AuthCookies.read(request, AuthCookies.ACCESS).orElse(null)
				: null;
	}

	static boolean usesCookieAuthentication(String path) {
		if (!path.startsWith("/api/") || path.startsWith("/api/public/")) {
			return false;
		}
		return !path.startsWith("/api/auth/") || path.equals("/api/auth/me");
	}
}
