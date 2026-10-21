package sn.cryptoplatform.user.internal;

import java.time.Instant;
import java.util.EnumSet;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import sn.cryptoplatform.user.ExpertiseLevel;
import sn.cryptoplatform.user.PublicProfile;
import sn.cryptoplatform.user.Role;
import sn.cryptoplatform.user.UserAccount;
import sn.cryptoplatform.user.UserStatus;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(columnDefinition = "citext", nullable = false)
	private String email;

	@Column(columnDefinition = "citext", nullable = false)
	private String username;

	private String passwordHash;

	@Column(nullable = false)
	private String displayName;

	private String headline;

	private String bio;

	private Long avatarMediaId;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ExpertiseLevel expertiseLevel = ExpertiseLevel.BEGINNER;

	private int reputation;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private UserStatus status = UserStatus.ACTIVE;

	private int tokenVersion;

	private Instant emailVerifiedAt;

	private Instant lastSeenAt;

	private Instant createdAt;

	private Instant updatedAt;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
	@Column(name = "role")
	@Enumerated(EnumType.STRING)
	private Set<Role> roles = EnumSet.noneOf(Role.class);

	User(String email, String username, String displayName, String passwordHash) {
		this.email = email;
		this.username = username;
		this.displayName = displayName;
		this.passwordHash = passwordHash;
		this.roles.add(Role.MEMBER);
	}

	void verifyEmail() {
		if (emailVerifiedAt == null) {
			emailVerifiedAt = Instant.now();
		}
	}

	void changePasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

	void grant(Role role) {
		roles.add(role);
	}

	/** Invalide tous les JWT déjà émis pour ce compte. */
	void revokeTokens() {
		tokenVersion++;
	}

	void updateProfile(String displayName, String headline, String bio) {
		this.displayName = displayName;
		this.headline = headline;
		this.bio = bio;
	}

	void changeAvatar(Long avatarMediaId) {
		this.avatarMediaId = avatarMediaId;
	}

	UserAccount toAccount() {
		return new UserAccount(id, email, username, displayName, expertiseLevel, reputation, Set.copyOf(roles), status,
				emailVerifiedAt != null, tokenVersion, createdAt, toPublicProfile());
	}

	PublicProfile toPublicProfile() {
		return new PublicProfile(id, username, displayName, headline, bio, PublicProfile.avatarUrl(avatarMediaId));
	}

	@PrePersist
	void onCreate() {
		createdAt = updatedAt = Instant.now();
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = Instant.now();
	}
}
