package sn.cryptoplatform.auth.internal;

import java.time.Duration;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import sn.cryptoplatform.shared.ratelimit.RateLimiter;
import sn.cryptoplatform.shared.web.ApiException;
import sn.cryptoplatform.user.UserAccount;
import sn.cryptoplatform.user.UserService;

@Service
class LoginService {

	private static final Duration WINDOW = Duration.ofMinutes(15);

	private final UserService users;
	private final PasswordEncoder passwords;
	private final SessionService sessions;
	private final RateLimiter rateLimiter;

	/** Hash de référence : une adresse inconnue coûte autant de calcul qu'une adresse existante. */
	private final String dummyHash;

	LoginService(UserService users, PasswordEncoder passwords, SessionService sessions, RateLimiter rateLimiter) {
		this.users = users;
		this.passwords = passwords;
		this.sessions = sessions;
		this.rateLimiter = rateLimiter;
		this.dummyHash = passwords.encode(Tokens.random());
	}

	/**
	 * Volontairement sans transaction englobante : chaque appel (lecture du compte, ouverture de
	 * session) a la sienne. Ainsi aucune connexion à la base n'est retenue pendant le calcul
	 * Argon2id, et un échec n'annule pas le compteur de tentatives.
	 */
	SessionService.Session login(String email, String password, String clientIp) {
		rateLimiter.hit("login:ip:" + clientIp, 30, WINDOW);
		String failuresKey = "login:fail:" + Tokens.sha256Hex(UserService.normalizeEmail(email));
		rateLimiter.check(failuresKey, 10);

		Optional<UserAccount> account = users.findByEmail(email);
		String hash = account.flatMap(user -> users.findPasswordHash(user.id())).orElse(null);
		boolean matches = passwords.matches(password, hash != null ? hash : dummyHash) && hash != null;
		if (!matches) {
			rateLimiter.increment(failuresKey, WINDOW);
			throw ApiException.unauthorized("INVALID_CREDENTIALS", "Adresse e-mail ou mot de passe incorrect.");
		}
		rateLimiter.reset(failuresKey);

		UserAccount user = account.get();
		if (!user.isActive()) {
			throw ApiException.forbidden("ACCOUNT_SUSPENDED", "Ce compte est suspendu.");
		}
		if (!user.emailVerified()) {
			throw ApiException.forbidden("EMAIL_NOT_VERIFIED",
					"Confirmez d'abord votre adresse e-mail grâce au lien reçu à l'inscription.");
		}
		if (passwords.upgradeEncoding(hash)) {
			users.changePasswordHash(user.id(), passwords.encode(password));
		}
		return sessions.open(user);
	}
}
