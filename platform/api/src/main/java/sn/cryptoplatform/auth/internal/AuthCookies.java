package sn.cryptoplatform.auth.internal;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/**
 * Jetons transportés dans des cookies httpOnly (inaccessibles au JavaScript), SameSite=Lax
 * (jamais envoyés sur un POST venu d'un autre site) et Secure.
 */
@Component
class AuthCookies {

	static final String ACCESS = "access_token";
	static final String REFRESH = "refresh_token";

	private final AuthProperties properties;

	AuthCookies(AuthProperties properties) {
		this.properties = properties;
	}

	void write(HttpServletResponse response, SessionService.IssuedTokens tokens) {
		add(response, ACCESS, tokens.accessToken(), properties.accessTokenTtl());
		add(response, REFRESH, tokens.refreshToken(), properties.refreshTokenTtl());
	}

	void clear(HttpServletResponse response) {
		add(response, ACCESS, "", Duration.ZERO);
		add(response, REFRESH, "", Duration.ZERO);
	}

	static Optional<String> read(HttpServletRequest request, String name) {
		Cookie[] cookies = request.getCookies();
		if (cookies == null) {
			return Optional.empty();
		}
		return Arrays.stream(cookies)
				.filter(cookie -> name.equals(cookie.getName()) && !cookie.getValue().isBlank())
				.map(Cookie::getValue)
				.findFirst();
	}

	private void add(HttpServletResponse response, String name, String value, Duration maxAge) {
		ResponseCookie cookie = ResponseCookie.from(name, value)
				.httpOnly(true)
				.secure(properties.secureCookies())
				.sameSite("Lax")
				.path("/")
				.maxAge(maxAge)
				.build();
		response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
	}
}
