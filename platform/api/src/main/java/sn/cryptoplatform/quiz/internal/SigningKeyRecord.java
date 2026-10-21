package sn.cryptoplatform.quiz.internal;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Clé publique qui a servi (ou sert) à signer des certificats. */
@Entity
@Table(name = "certificate_signing_keys")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class SigningKeyRecord {

	@Id
	private String keyId;

	private String algorithm;

	private byte[] publicKey;

	private Instant createdAt;

	SigningKeyRecord(String keyId, byte[] publicKey) {
		this.keyId = keyId;
		this.algorithm = "Ed25519";
		this.publicKey = publicKey;
		this.createdAt = Instant.now();
	}
}
