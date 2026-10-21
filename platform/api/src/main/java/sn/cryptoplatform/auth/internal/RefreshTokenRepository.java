package sn.cryptoplatform.auth.internal;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

	/** Verrou en écriture : deux rafraîchissements simultanés du même jeton sont sérialisés. */
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	Optional<RefreshToken> findByTokenHash(byte[] tokenHash);

	@Modifying
	@Query("update RefreshToken t set t.revokedAt = :now where t.familyId = :familyId and t.revokedAt is null")
	int revokeFamily(UUID familyId, Instant now);

	@Modifying
	@Query("update RefreshToken t set t.revokedAt = :now where t.userId = :userId and t.revokedAt is null")
	int revokeAllOfUser(long userId, Instant now);
}
