package sn.cryptoplatform.auth.internal;

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

/** Lien entre un compte de la plateforme et un compte Google ou GitHub. */
@Entity
@Table(name = "oauth_accounts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class OAuthAccount {

	enum Provider {
		GOOGLE, GITHUB
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private Long userId;

	@Enumerated(EnumType.STRING)
	private Provider provider;

	private String providerUserId;

	OAuthAccount(long userId, Provider provider, String providerUserId) {
		this.userId = userId;
		this.provider = provider;
		this.providerUserId = providerUserId;
	}
}
