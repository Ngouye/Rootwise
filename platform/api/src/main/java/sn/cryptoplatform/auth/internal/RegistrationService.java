package sn.cryptoplatform.auth.internal;

import java.time.Duration;
import java.util.Locale;
import java.util.Set;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.cryptoplatform.shared.ratelimit.RateLimiter;
import sn.cryptoplatform.shared.web.ApiException;
import sn.cryptoplatform.user.UserAccount;
import sn.cryptoplatform.user.UserService;

@Service
class RegistrationService {

	private static final Set<String> RESERVED_USERNAMES = Set.of("admin", "administrateur", "administrator", "root",
			"system", "systeme", "support", "moderateur", "moderator", "staff", "api", "www", "cryptoplatform",
			"null", "undefined", "anonymous", "anonyme");

	private final UserService users;
	private final PasswordEncoder passwords;
	private final EmailTokenService emailTokens;
	private final SessionService sessions;
	private final RateLimiter rateLimiter;
	private final ApplicationEventPublisher events;

	RegistrationService(UserService users, PasswordEncoder passwords, EmailTokenService emailTokens,
			SessionService sessions, RateLimiter rateLimiter, ApplicationEventPublisher events) {
		this.users = users;
		this.passwords = passwords;
		this.emailTokens = emailTokens;
		this.sessions = sessions;
		this.rateLimiter = rateLimiter;
		this.events = events;
	}

	/**
	 * Même réponse que l'adresse soit libre ou déjà inscrite : dans le second cas, le titulaire
	 * reçoit simplement un e-mail d'information. Les noms d'utilisateur étant publics, eux
	 * peuvent être signalés comme pris.
	 */
	@Transactional
	void register(AuthDtos.RegisterRequest request, String clientIp) {
		rateLimiter.hit("register:ip:" + clientIp, 5, Duration.ofHours(1));

		String username = request.username().trim();
		if (RESERVED_USERNAMES.contains(username.toLowerCase(Locale.ROOT)) || users.isUsernameTaken(username)) {
			throw ApiException.conflict("USERNAME_TAKEN", "Ce nom d'utilisateur n'est pas disponible.");
		}
		// Hachage systématique : la durée de la requête ne révèle pas si l'adresse existe.
		String passwordHash = passwords.encode(request.password());

		var existing = users.findByEmail(request.email());
		if (existing.isPresent()) {
			events.publishEvent(new AuthEvents.DuplicateRegistrationAttempted(existing.get().id()));
			return;
		}
		try {
			users.registerWithPassword(request.email(), username, request.displayName(), passwordHash);
		} catch (DataIntegrityViolationException raceWithAnotherRegistration) {
			throw ApiException.conflict("REGISTRATION_CONFLICT", "Inscription impossible pour le moment, réessayez.");
		}
	}

	@Transactional
	void resendVerification(String email, String clientIp) {
		rateLimiter.hit("verify-resend:ip:" + clientIp, 10, Duration.ofHours(1));
		rateLimiter.hit("verify-resend:email:" + Tokens.sha256Hex(UserService.normalizeEmail(email)), 3, Duration.ofHours(1));
		users.findByEmail(email)
				.filter(user -> user.isActive() && !user.emailVerified())
				.ifPresent(user -> events.publishEvent(new AuthEvents.VerificationEmailRequested(user.id())));
	}

	/** Le lien reçu prouve la possession de l'adresse : le compte est activé et la session ouverte. */
	@Transactional
	SessionService.Session verifyEmail(String token) {
		long userId = emailTokens.consume(token, AuthToken.Purpose.VERIFY_EMAIL)
				.orElseThrow(() -> ApiException.badRequest("INVALID_TOKEN", "Ce lien est invalide ou a expiré."));
		UserAccount user = users.markEmailVerified(userId);
		if (!user.isActive()) {
			throw ApiException.forbidden("ACCOUNT_SUSPENDED", "Ce compte est suspendu.");
		}
		return sessions.open(user);
	}
}
