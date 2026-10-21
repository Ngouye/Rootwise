package sn.cryptoplatform.auth.internal;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * @param jwtSecret      clé HMAC en Base64 (au moins 32 octets) ; vide = clé éphémère, réservée au développement
 * @param secureCookies  attribut Secure des cookies (à laisser à true, localhost est accepté par les navigateurs)
 */
@ConfigurationProperties("app.auth")
public record AuthProperties(
		String jwtSecret,
		@DefaultValue("15m") Duration accessTokenTtl,
		@DefaultValue("30d") Duration refreshTokenTtl,
		@DefaultValue("24h") Duration emailVerificationTtl,
		@DefaultValue("30m") Duration passwordResetTtl,
		@DefaultValue("true") boolean secureCookies,
		@DefaultValue OAuth oauth) {

	public record OAuth(@DefaultValue Client google, @DefaultValue Client github) {
	}

	public record Client(String clientId, String clientSecret) {

		boolean isConfigured() {
			return clientId != null && !clientId.isBlank() && clientSecret != null && !clientSecret.isBlank();
		}
	}
}
