package sn.cryptoplatform.auth.internal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.cryptoplatform.user.UserAccount;
import sn.cryptoplatform.user.UserService;

@Service
class OAuthAccountService {

	/** Le fournisseur n'a pas fourni d'adresse vérifiée : impossible de rattacher ou créer un compte sûrement. */
	static class UnverifiedEmailException extends RuntimeException {
	}

	private final OAuthAccountRepository oauthAccounts;
	private final UserService users;
	private final SessionService sessions;

	OAuthAccountService(OAuthAccountRepository oauthAccounts, UserService users, SessionService sessions) {
		this.oauthAccounts = oauthAccounts;
		this.users = users;
		this.sessions = sessions;
	}

	/**
	 * Retrouve le compte lié, sinon rattache le compte existant de même adresse, sinon en crée un.
	 * <p>
	 * Pré-détournement : un tiers peut avoir inscrit l'adresse de la victime avec son propre mot de
	 * passe sans jamais la vérifier. Si la victime arrive ensuite par Google/GitHub (adresse vérifiée),
	 * ce mot de passe est supprimé et les sessions éventuelles du tiers sont fermées.
	 */
	@Transactional
	UserAccount loginOrRegister(ExternalIdentity identity) {
		var linked = oauthAccounts.findByProviderAndProviderUserId(identity.provider(), identity.providerUserId());
		if (linked.isPresent()) {
			return users.findById(linked.get().getUserId()).orElseThrow();
		}
		if (identity.email() == null || !identity.emailVerified()) {
			throw new UnverifiedEmailException();
		}

		long userId = users.findByEmail(identity.email())
				.map(existing -> {
					if (!existing.emailVerified()) {
						users.removePassword(existing.id());
						sessions.closeAll(existing.id());
						users.markEmailVerified(existing.id());
					}
					return existing.id();
				})
				.orElseGet(() -> users.registerExternal(identity.email(), identity.usernameHint(), identity.displayName()).id());

		oauthAccounts.save(new OAuthAccount(userId, identity.provider(), identity.providerUserId()));
		return users.findById(userId).orElseThrow();
	}
}
