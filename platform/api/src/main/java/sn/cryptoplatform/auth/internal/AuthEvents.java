package sn.cryptoplatform.auth.internal;

/**
 * Événements internes au module. Les e-mails partent de façon asynchrone, après la transaction :
 * la réponse HTTP prend le même temps que le compte existe ou non (pas d'énumération des adresses).
 */
final class AuthEvents {

	private AuthEvents() {
	}

	record VerificationEmailRequested(long userId) {
	}

	record DuplicateRegistrationAttempted(long userId) {
	}

	record PasswordResetRequested(long userId) {
	}
}
