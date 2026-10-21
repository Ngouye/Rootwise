package sn.cryptoplatform.quiz.internal;

import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.interfaces.EdECPrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.HexFormat;

import org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Signature Ed25519 des certificats. La clé privée vient de CERT_SIGNING_KEY (PKCS#8 en Base64,
 * par exemple : openssl genpkey -algorithm ed25519 | openssl pkcs8 -topk8 -nocrypt -outform der | base64).
 * La clé publique correspondante est enregistrée en base : tout certificat reste vérifiable,
 * même après un changement de clé.
 */
@Component
class CertificateSigner {

	static final String ALGORITHM = "Ed25519";

	/** En-tête DER d'une clé publique Ed25519 (SubjectPublicKeyInfo) avant les 32 octets bruts. */
	private static final byte[] X509_ED25519_PREFIX = HexFormat.of().parseHex("302a300506032b6570032100");

	private static final Logger log = LoggerFactory.getLogger(CertificateSigner.class);

	private final PrivateKey privateKey;
	private final byte[] publicKeyDer;
	private final String keyId;
	private final SigningKeyRepository keys;

	CertificateSigner(@Value("${app.certificates.signing-key:}") String encodedPrivateKey, SigningKeyRepository keys)
			throws GeneralSecurityException {
		this.keys = keys;
		if (encodedPrivateKey == null || encodedPrivateKey.isBlank()) {
			log.warn("CERT_SIGNING_KEY absent : clé de signature des certificats éphémère (développement uniquement).");
			KeyPair pair = KeyPairGenerator.getInstance(ALGORITHM).generateKeyPair();
			this.privateKey = pair.getPrivate();
			this.publicKeyDer = pair.getPublic().getEncoded();
		} else {
			this.privateKey = KeyFactory.getInstance(ALGORITHM)
					.generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(encodedPrivateKey.trim())));
			this.publicKeyDer = derivePublicKey((EdECPrivateKey) privateKey);
		}
		this.keyId = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(publicKeyDer)).substring(0, 16);
	}

	@EventListener(ApplicationReadyEvent.class)
	void registerPublicKey() {
		if (!keys.existsById(keyId)) {
			keys.save(new SigningKeyRecord(keyId, publicKeyDer));
		}
	}

	String keyId() {
		return keyId;
	}

	byte[] sign(byte[] data) {
		try {
			Signature signature = Signature.getInstance(ALGORITHM);
			signature.initSign(privateKey);
			signature.update(data);
			return signature.sign();
		} catch (GeneralSecurityException e) {
			throw new IllegalStateException("Signature du certificat impossible", e);
		}
	}

	static boolean verify(byte[] data, byte[] signatureBytes, byte[] publicKeyDer) {
		try {
			PublicKey publicKey = KeyFactory.getInstance(ALGORITHM).generatePublic(new X509EncodedKeySpec(publicKeyDer));
			Signature signature = Signature.getInstance(ALGORITHM);
			signature.initVerify(publicKey);
			signature.update(data);
			return signature.verify(signatureBytes);
		} catch (GeneralSecurityException e) {
			return false;
		}
	}

	static String toPem(byte[] publicKeyDer) {
		String body = Base64.getMimeEncoder(64, new byte[] { '\n' }).encodeToString(publicKeyDer);
		return "-----BEGIN PUBLIC KEY-----\n" + body + "\n-----END PUBLIC KEY-----\n";
	}

	/** Le JDK ne dérive pas la clé publique d'une clé privée EdDSA : BouncyCastle le fait. */
	private static byte[] derivePublicKey(EdECPrivateKey privateKey) {
		byte[] raw = privateKey.getBytes().orElseThrow(() -> new IllegalStateException("Clé privée Ed25519 illisible"));
		byte[] publicRaw = new Ed25519PrivateKeyParameters(raw, 0).generatePublicKey().getEncoded();
		byte[] der = new byte[X509_ED25519_PREFIX.length + publicRaw.length];
		System.arraycopy(X509_ED25519_PREFIX, 0, der, 0, X509_ED25519_PREFIX.length);
		System.arraycopy(publicRaw, 0, der, X509_ED25519_PREFIX.length, publicRaw.length);
		return der;
	}
}
