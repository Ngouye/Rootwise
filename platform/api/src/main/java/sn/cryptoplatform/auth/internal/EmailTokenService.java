package sn.cryptoplatform.auth.internal;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class EmailTokenService {

	private final AuthTokenRepository tokens;

	EmailTokenService(AuthTokenRepository tokens) {
		this.tokens = tokens;
	}

	/** Crée un jeton et invalide les précédents du même type ; renvoie la valeur brute (jamais stockée). */
	@Transactional
	String create(long userId, AuthToken.Purpose purpose, Duration ttl) {
		Instant now = Instant.now();
		tokens.invalidateUnused(userId, purpose, now);
		String raw = Tokens.random();
		tokens.save(new AuthToken(userId, purpose, Tokens.sha256(raw), now.plus(ttl)));
		return raw;
	}

	/** Consomme le jeton s'il est valide et renvoie l'identifiant du compte concerné. */
	@Transactional
	Optional<Long> consume(String raw, AuthToken.Purpose purpose) {
		Instant now = Instant.now();
		return tokens.findByTokenHashAndPurpose(Tokens.sha256(raw), purpose)
				.filter(token -> token.isUsable(now))
				.map(token -> {
					token.markUsed(now);
					return token.getUserId();
				});
	}
}
