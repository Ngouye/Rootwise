package sn.cryptoplatform.auth.internal;

import java.time.Instant;
import java.util.Optional;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	Optional<AuthToken> findByTokenHashAndPurpose(byte[] tokenHash, AuthToken.Purpose purpose);

	/** Seul le dernier lien envoyé reste valable. */
	@Modifying
	@Query("update AuthToken t set t.usedAt = :now where t.userId = :userId and t.purpose = :purpose and t.usedAt is null")
	int invalidateUnused(long userId, AuthToken.Purpose purpose, Instant now);
}
