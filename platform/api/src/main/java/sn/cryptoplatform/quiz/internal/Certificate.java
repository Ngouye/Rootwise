package sn.cryptoplatform.quiz.internal;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnTransformer;

/**
 * Certificat de réussite. {@code payload} est un objet JSON plat (textes uniquement) ; la
 * signature Ed25519 porte sur sa forme canonique (clés triées, sans espaces).
 */
@Entity
@Table(name = "certificates")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class Certificate {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private Long userId;

	private Long courseId;

	private UUID serial;

	@Column(columnDefinition = "jsonb")
	@ColumnTransformer(read = "payload::text", write = "?::jsonb")
	private String payload;

	private byte[] signature;

	private String signingKeyId;

	private Instant issuedAt;

	Certificate(long userId, long courseId, UUID serial, String payload, byte[] signature, String signingKeyId,
			Instant issuedAt) {
		this.userId = userId;
		this.courseId = courseId;
		this.serial = serial;
		this.payload = payload;
		this.signature = signature;
		this.signingKeyId = signingKeyId;
		this.issuedAt = issuedAt;
	}
}
