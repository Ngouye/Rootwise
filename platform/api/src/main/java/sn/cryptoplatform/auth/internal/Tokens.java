package sn.cryptoplatform.auth.internal;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/** Jetons opaques : 256 bits aléatoires côté client, seule leur empreinte SHA-256 est stockée. */
final class Tokens {

	private static final SecureRandom RANDOM = new SecureRandom();

	private Tokens() {
	}

	static String random() {
		byte[] bytes = new byte[32];
		RANDOM.nextBytes(bytes);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	static byte[] sha256(String value) {
		try {
			return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
		} catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException(e);
		}
	}

	/** Empreinte hexadécimale, pour construire des clés de limitation sans donnée personnelle en clair. */
	static String sha256Hex(String value) {
		return HexFormat.of().formatHex(sha256(value));
	}
}
