package sn.cryptoplatform.shared.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import sn.cryptoplatform.shared.web.ApiException;

/** Identité du membre authentifié par le JWT de la requête en cours. */
public final class CurrentUser {

	private CurrentUser() {
	}

	public static long id() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication instanceof JwtAuthenticationToken jwt) {
			return Long.parseLong(jwt.getToken().getSubject());
		}
		throw ApiException.unauthorized("UNAUTHENTICATED", "Authentification requise.");
	}
}
