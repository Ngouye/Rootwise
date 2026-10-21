package sn.cryptoplatform.auth.internal;

import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

import sn.cryptoplatform.user.UserAccount;
import sn.cryptoplatform.user.UserRegistered;
import sn.cryptoplatform.user.UserService;

/**
 * Envoi des e-mails après validation de la transaction, en asynchrone. Chaque publication est
 * enregistrée (table event_publication) : un envoi qui échoue est rejoué au redémarrage.
 * Le jeton est créé ici, dans la transaction du listener, pour que sa valeur brute ne soit
 * jamais sérialisée dans l'événement.
 */
@Component
class AuthMailListener {

	private final UserService users;
	private final EmailTokenService emailTokens;
	private final AuthMailer mailer;
	private final AuthProperties properties;

	AuthMailListener(UserService users, EmailTokenService emailTokens, AuthMailer mailer, AuthProperties properties) {
		this.users = users;
		this.emailTokens = emailTokens;
		this.mailer = mailer;
		this.properties = properties;
	}

	@ApplicationModuleListener
	void on(UserRegistered event) {
		if (!event.emailVerified()) {
			sendVerification(event.userId());
		}
	}

	@ApplicationModuleListener
	void on(AuthEvents.VerificationEmailRequested event) {
		sendVerification(event.userId());
	}

	@ApplicationModuleListener
	void on(AuthEvents.DuplicateRegistrationAttempted event) {
		users.findById(event.userId()).filter(UserAccount::isActive).ifPresent(mailer::sendDuplicateRegistration);
	}

	@ApplicationModuleListener
	void on(AuthEvents.PasswordResetRequested event) {
		users.findById(event.userId()).filter(UserAccount::isActive).ifPresent(user -> mailer.sendPasswordReset(user,
				emailTokens.create(user.id(), AuthToken.Purpose.RESET_PASSWORD, properties.passwordResetTtl())));
	}

	private void sendVerification(long userId) {
		users.findById(userId)
				.filter(user -> user.isActive() && !user.emailVerified())
				.ifPresent(user -> mailer.sendVerification(user,
						emailTokens.create(user.id(), AuthToken.Purpose.VERIFY_EMAIL, properties.emailVerificationTtl())));
	}
}
