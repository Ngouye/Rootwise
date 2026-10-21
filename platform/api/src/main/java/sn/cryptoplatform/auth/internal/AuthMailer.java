package sn.cryptoplatform.auth.internal;

import java.time.Duration;

import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Component;

import sn.cryptoplatform.shared.AppProperties;
import sn.cryptoplatform.user.UserAccount;

/**
 * E-mails du module. Les jetons sont placés après le « # » du lien : le fragment n'est jamais
 * envoyé au serveur, il n'apparaît donc ni dans les journaux HTTP ni dans l'en-tête Referer.
 */
@Component
class AuthMailer {

	private final MailSender mailSender;
	private final AppProperties app;
	private final AuthProperties properties;

	AuthMailer(MailSender mailSender, AppProperties app, AuthProperties properties) {
		this.mailSender = mailSender;
		this.app = app;
		this.properties = properties;
	}

	void sendVerification(UserAccount user, String token) {
		send(user, "Confirmez votre adresse e-mail", """
				Bonjour %s,

				Bienvenue sur %s ! Pour activer votre compte, confirmez votre adresse e-mail :
				%s

				Ce lien expire dans %s. Si vous n'êtes pas à l'origine de cette inscription, ignorez ce message.
				""".formatted(user.displayName(), app.name(), app.url("/verifier-email#token=" + token),
				humanize(properties.emailVerificationTtl())));
	}

	void sendDuplicateRegistration(UserAccount user) {
		send(user, "Tentative d'inscription avec votre adresse", """
				Bonjour %s,

				Quelqu'un, peut-être vous, a demandé à créer un compte %s avec cette adresse e-mail.
				Elle est déjà associée à votre compte : aucun nouveau compte n'a été créé.

				Se connecter : %s
				Mot de passe oublié : %s
				""".formatted(user.displayName(), app.name(), app.url("/connexion"), app.url("/mot-de-passe-oublie")));
	}

	void sendPasswordReset(UserAccount user, String token) {
		send(user, "Réinitialisation de votre mot de passe", """
				Bonjour %s,

				Pour choisir un nouveau mot de passe, ouvrez ce lien :
				%s

				Ce lien expire dans %s et ne fonctionne qu'une fois. Toutes vos sessions ouvertes seront fermées.
				Si vous n'avez rien demandé, ignorez ce message : votre mot de passe actuel reste valable.
				""".formatted(user.displayName(), app.url("/reinitialiser-mot-de-passe#token=" + token),
				humanize(properties.passwordResetTtl())));
	}

	private void send(UserAccount to, String subject, String text) {
		SimpleMailMessage message = new SimpleMailMessage();
		message.setFrom(app.mailFrom());
		message.setTo(to.email());
		message.setSubject("[" + app.name() + "] " + subject);
		message.setText(text);
		mailSender.send(message);
	}

	private static String humanize(Duration duration) {
		long hours = duration.toHours();
		if (hours >= 1) {
			return hours + (hours > 1 ? " heures" : " heure");
		}
		return duration.toMinutes() + " minutes";
	}
}
