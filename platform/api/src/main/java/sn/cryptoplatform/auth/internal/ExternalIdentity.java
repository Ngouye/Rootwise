package sn.cryptoplatform.auth.internal;

import java.util.Locale;

import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;

/** Identité renvoyée par un fournisseur OAuth, ramenée à ce dont la plateforme a besoin. */
record ExternalIdentity(
		OAuthAccount.Provider provider,
		String providerUserId,
		String email,
		boolean emailVerified,
		String displayName,
		String usernameHint) {

	static ExternalIdentity from(String registrationId, OAuth2User user) {
		return switch (registrationId) {
			case "google" -> fromGoogle((OidcUser) user);
			case "github" -> fromGitHub(user);
			default -> throw new IllegalArgumentException("Fournisseur OAuth inconnu : " + registrationId);
		};
	}

	private static ExternalIdentity fromGoogle(OidcUser user) {
		String email = user.getEmail();
		String name = user.getFullName() != null ? user.getFullName() : localPart(email);
		return new ExternalIdentity(OAuthAccount.Provider.GOOGLE, user.getSubject(), email,
				Boolean.TRUE.equals(user.getEmailVerified()), name, localPart(email));
	}

	private static ExternalIdentity fromGitHub(OAuth2User user) {
		String email = user.getAttribute(GitHubEmailUserService.VERIFIED_EMAIL);
		String login = user.getAttribute("login");
		String name = user.getAttribute("name");
		return new ExternalIdentity(OAuthAccount.Provider.GITHUB, String.valueOf(user.getAttributes().get("id")), email,
				email != null, name != null && !name.isBlank() ? name : login, login);
	}

	private static String localPart(String email) {
		return email == null ? "membre" : email.substring(0, email.indexOf('@')).toLowerCase(Locale.ROOT);
	}
}
