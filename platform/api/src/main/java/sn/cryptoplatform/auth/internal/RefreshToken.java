package sn.cryptoplatform.auth.internal;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "refresh_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class RefreshToken {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private Long userId;

	private byte[] tokenHash;

	private UUID familyId;

	private Instant expiresAt;

	private Instant revokedAt;

	private Instant rotatedAt;

	private Instant createdAt;

	RefreshToken(long userId, byte[] tokenHash, UUID familyId, Instant expiresAt) {
		this.userId = userId;
		this.tokenHash = tokenHash;
		this.familyId = familyId;
		this.expiresAt = expiresAt;
		this.createdAt = Instant.now();
	}

	void markRotated(Instant now) {
		rotatedAt = now;
	}
}
