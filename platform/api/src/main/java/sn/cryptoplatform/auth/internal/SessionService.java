package sn.cryptoplatform.auth.internal;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.cryptoplatform.shared.web.ApiException;
import sn.cryptoplatform.user.UserAccount;
import sn.cryptoplatform.user.UserService;

/**
 * Session = JWT d'accès court + jeton de rafraîchissement opaque, remplacé à chaque usage.
 * Présenter un jeton déjà remplacé (hors délai de grâce) révoque toute sa famille : un voleur
 * et la victime ne peuvent pas continuer tous les deux.
 */
@Service
class SessionService {

	/** Deux onglets qui rafraîchissent au même instant présentent le même jeton. */
	private static final Duration ROTATION_GRACE = Duration.ofSeconds(30);

	private static final Logger log = LoggerFactory.getLogger(SessionService.class);

	record IssuedTokens(String accessToken, String refreshToken) {
	}

	record Session(UserAccount user, IssuedTokens tokens) {
	}

	private final RefreshTokenRepository refreshTokens;
	private final JwtConfig.AccessTokens accessTokens;
	private final UserService users;
	private final AuthProperties properties;

	SessionService(RefreshTokenRepository refreshTokens, JwtConfig.AccessTokens accessTokens, UserService users,
			AuthProperties properties) {
		this.refreshTokens = refreshTokens;
		this.accessTokens = accessTokens;
		this.users = users;
		this.properties = properties;
	}

	@Transactional
	Session open(UserAccount user) {
		return new Session(user, issue(user, UUID.randomUUID()));
	}

	/** Les révocations doivent survivre à l'erreur 401 renvoyée ensuite, d'où le noRollbackFor. */
	@Transactional(noRollbackFor = ApiException.class)
	Session refresh(String rawRefreshToken) {
		Instant now = Instant.now();
		RefreshToken token = refreshTokens.findByTokenHash(Tokens.sha256(rawRefreshToken))
				.orElseThrow(SessionService::expired);

		if (token.getRevokedAt() != null || token.getExpiresAt().isBefore(now)) {
			throw expired();
		}
		if (token.getRotatedAt() != null && token.getRotatedAt().plus(ROTATION_GRACE).isBefore(now)) {
			refreshTokens.revokeFamily(token.getFamilyId(), now);
			log.warn("Jeton de rafraîchissement déjà remplacé présenté à nouveau (utilisateur {}) : famille révoquée",
					token.getUserId());
			throw expired();
		}
		if (token.getRotatedAt() == null) {
			token.markRotated(now);
		}

		UserAccount user = users.findById(token.getUserId())
				.filter(account -> account.isActive() && account.emailVerified())
				.orElse(null);
		if (user == null) {
			refreshTokens.revokeFamily(token.getFamilyId(), now);
			throw expired();
		}
		return new Session(user, issue(user, token.getFamilyId()));
	}

	@Transactional
	void close(String rawRefreshToken) {
		refreshTokens.findByTokenHash(Tokens.sha256(rawRefreshToken))
				.ifPresent(token -> refreshTokens.revokeFamily(token.getFamilyId(), Instant.now()));
	}

	/** Déconnecte le compte partout : jetons de rafraîchissement révoqués et JWT invalidés. */
	@Transactional
	void closeAll(long userId) {
		refreshTokens.revokeAllOfUser(userId, Instant.now());
		users.revokeTokens(userId);
	}

	private IssuedTokens issue(UserAccount user, UUID familyId) {
		String raw = Tokens.random();
		refreshTokens.save(new RefreshToken(user.id(), Tokens.sha256(raw), familyId,
				Instant.now().plus(properties.refreshTokenTtl())));
		return new IssuedTokens(accessTokens.issue(user), raw);
	}

	private static ApiException expired() {
		return ApiException.unauthorized("SESSION_EXPIRED", "Session expirée, reconnectez-vous.");
	}
}
