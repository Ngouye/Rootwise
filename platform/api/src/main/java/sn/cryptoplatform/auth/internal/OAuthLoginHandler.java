package sn.cryptoplatform.auth.internal;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import sn.cryptoplatform.shared.AppProperties;
import sn.cryptoplatform.user.UserAccount;

/**
 * Fin du parcours OAuth : ouvre une session maison (mêmes cookies qu'une connexion par mot de
 * passe) puis renvoie vers le site. La session HTTP, créée uniquement pour conserver le paramètre
 * « state » pendant l'aller-retour chez le fournisseur, est détruite.
 */
@Component
class OAuthLoginHandler implements AuthenticationSuccessHandler, AuthenticationFailureHandler {

	private static final Logger log = LoggerFactory.getLogger(OAuthLoginHandler.class);

	private final OAuthAccountService oauthAccounts;
	private final SessionService sessions;
	private final AuthCookies cookies;
	private final AppProperties app;

	OAuthLoginHandler(OAuthAccountService oauthAccounts, SessionService sessions, AuthCookies cookies, AppProperties app) {
		this.oauthAccounts = oauthAccounts;
		this.sessions = sessions;
		this.cookies = cookies;
		this.app = app;
	}

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException {
		discardHttpSession(request);
		OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
		try {
			UserAccount user = oauthAccounts.loginOrRegister(
					ExternalIdentity.from(token.getAuthorizedClientRegistrationId(), token.getPrincipal()));
			if (!user.isActive()) {
				response.sendRedirect(app.url("/connexion?erreur=compte-suspendu"));
				return;
			}
			cookies.write(response, sessions.open(user).tokens());
			response.sendRedirect(app.url("/"));
		} catch (OAuthAccountService.UnverifiedEmailException e) {
			response.sendRedirect(app.url("/connexion?erreur=email-non-verifie"));
		}
	}

	@Override
	public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException exception) throws IOException {
		log.info("Échec de connexion OAuth : {}", exception.getMessage());
		discardHttpSession(request);
		response.sendRedirect(app.url("/connexion?erreur=oauth"));
	}

	private static void discardHttpSession(HttpServletRequest request) {
		SecurityContextHolder.clearContext();
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.invalidate();
		}
	}
}
