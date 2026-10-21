package sn.cryptoplatform.auth.internal;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Jeton à usage unique envoyé par e-mail (vérification d'adresse, mot de passe oublié). */
@Entity
@Table(name = "auth_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class AuthToken {

	enum Purpose {
		VERIFY_EMAIL, RESET_PASSWORD
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private Long userId;

	@Enumerated(EnumType.STRING)
	private Purpose purpose;

	private byte[] tokenHash;

	private Instant expiresAt;

	private Instant usedAt;

	AuthToken(long userId, Purpose purpose, byte[] tokenHash, Instant expiresAt) {
		this.userId = userId;
		this.purpose = purpose;
		this.tokenHash = tokenHash;
		this.expiresAt = expiresAt;
	}

	boolean isUsable(Instant now) {
		return usedAt == null && expiresAt.isAfter(now);
	}

	void markUsed(Instant now) {
		usedAt = now;
	}
}
