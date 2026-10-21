package sn.cryptoplatform.auth.internal;

import java.time.Duration;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.cryptoplatform.shared.ratelimit.RateLimiter;
import sn.cryptoplatform.shared.web.ApiException;
import sn.cryptoplatform.user.UserAccount;
import sn.cryptoplatform.user.UserService;

@Service
class PasswordResetService {

	private final UserService users;
	private final PasswordEncoder passwords;
	private final EmailTokenService emailTokens;
	private final SessionService sessions;
	private final RateLimiter rateLimiter;
	private final ApplicationEventPublisher events;

	PasswordResetService(UserService users, PasswordEncoder passwords, EmailTokenService emailTokens,
			SessionService sessions, RateLimiter rateLimiter, ApplicationEventPublisher events) {
		this.users = users;
		this.passwords = passwords;
		this.emailTokens = emailTokens;
		this.sessions = sessions;
		this.rateLimiter = rateLimiter;
		this.events = events;
	}

	/** Réponse identique que l'adresse existe ou non. */
	@Transactional
	void requestReset(String email, String clientIp) {
		rateLimiter.hit("reset:ip:" + clientIp, 10, Duration.ofHours(1));
		rateLimiter.hit("reset:email:" + Tokens.sha256Hex(UserService.normalizeEmail(email)), 3, Duration.ofHours(1));
		users.findByEmail(email)
				.filter(UserAccount::isActive)
				.ifPresent(user -> events.publishEvent(new AuthEvents.PasswordResetRequested(user.id())));
	}

	/** Nouveau mot de passe + fermeture de toutes les sessions existantes, partout. */
	@Transactional
	void reset(String token, String newPassword) {
		long userId = emailTokens.consume(token, AuthToken.Purpose.RESET_PASSWORD)
				.orElseThrow(() -> ApiException.badRequest("INVALID_TOKEN", "Ce lien est invalide ou a expiré."));
		users.changePasswordHash(userId, passwords.encode(newPassword));
		users.markEmailVerified(userId);
		sessions.closeAll(userId);
	}
}
