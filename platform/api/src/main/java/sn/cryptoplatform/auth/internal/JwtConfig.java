package sn.cryptoplatform.auth.internal;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Component;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

import sn.cryptoplatform.user.UserAccount;

/** JWT d'accès signés HMAC-SHA256, courts (15 min par défaut) et révocables via le claim {@code ver}. */
@Configuration
class JwtConfig {

	static final String ISSUER = "cryptoplatform";

	private static final Logger log = LoggerFactory.getLogger(JwtConfig.class);

	private final SecretKey key;

	JwtConfig(AuthProperties properties) {
		this.key = signingKey(properties.jwtSecret());
	}

	@Bean
	JwtEncoder jwtEncoder() {
		return new NimbusJwtEncoder(new ImmutableSecret<>(key));
	}

	@Bean
	JwtDecoder jwtDecoder(TokenVersionValidator tokenVersionValidator) {
		NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
		decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
				JwtValidators.createDefaultWithIssuer(ISSUER), tokenVersionValidator));
		return decoder;
	}

	private static SecretKey signingKey(String secret) {
		if (secret == null || secret.isBlank()) {
			log.warn("JWT_SECRET absent : clé de signature éphémère générée (sessions d'accès perdues au redémarrage). "
					+ "Définissez JWT_SECRET en production.");
			byte[] random = new byte[32];
			new SecureRandom().nextBytes(random);
			return new SecretKeySpec(random, "HmacSHA256");
		}
		byte[] bytes = Base64.getDecoder().decode(secret.trim());
		if (bytes.length < 32) {
			throw new IllegalStateException("JWT_SECRET doit contenir au moins 256 bits (32 octets encodés en Base64).");
		}
		return new SecretKeySpec(bytes, "HmacSHA256");
	}

	@Component
	static class AccessTokens {

		private final JwtEncoder encoder;
		private final AuthProperties properties;

		AccessTokens(JwtEncoder encoder, AuthProperties properties) {
			this.encoder = encoder;
			this.properties = properties;
		}

		String issue(UserAccount user) {
			Instant now = Instant.now();
			JwtClaimsSet claims = JwtClaimsSet.builder()
					.issuer(ISSUER)
					.subject(String.valueOf(user.id()))
					.issuedAt(now)
					.expiresAt(now.plus(properties.accessTokenTtl()))
					.claim("ver", user.tokenVersion())
					.claim("username", user.username())
					.claim("roles", user.roles().stream().map(Enum::name).sorted().toList())
					.build();
			JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
			return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
		}
	}
}
