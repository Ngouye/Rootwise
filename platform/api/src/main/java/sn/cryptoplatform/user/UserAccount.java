package sn.cryptoplatform.user;

import java.time.Instant;
import java.util.Set;

/** Vue en lecture seule d'un compte, exposée aux autres modules (jamais le hash du mot de passe). */
public record UserAccount(
		long id,
		String email,
		String username,
		String displayName,
		ExpertiseLevel expertiseLevel,
		int reputation,
		Set<Role> roles,
		UserStatus status,
		boolean emailVerified,
		int tokenVersion,
		Instant createdAt,
		PublicProfile profile) {

	public boolean isActive() {
		return status == UserStatus.ACTIVE;
	}
}
