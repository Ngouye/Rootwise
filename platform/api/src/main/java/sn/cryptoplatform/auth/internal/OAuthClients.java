package sn.cryptoplatform.auth.internal;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;

import sn.cryptoplatform.shared.AppProperties;

/**
 * Fournisseurs OAuth activés : seulement ceux dont l'identifiant et le secret sont fournis
 * (GOOGLE_CLIENT_ID/SECRET, GITHUB_CLIENT_ID/SECRET). Le retour se fait sur le domaine public
 * du site, que Next.js relaie vers l'API.
 */
class OAuthClients implements ClientRegistrationRepository, Iterable<ClientRegistration> {

	private final Map<String, ClientRegistration> registrations = new LinkedHashMap<>();

	OAuthClients(List<ClientRegistration> registrations) {
		registrations.forEach(registration -> this.registrations.put(registration.getRegistrationId(), registration));
	}

	@Override
	public ClientRegistration findByRegistrationId(String registrationId) {
		return registrations.get(registrationId);
	}

	@Override
	public Iterator<ClientRegistration> iterator() {
		return registrations.values().iterator();
	}

	List<String> providers() {
		return List.copyOf(registrations.keySet());
	}

	boolean isEmpty() {
		return registrations.isEmpty();
	}

	@Configuration
	static class Config {

		@Bean
		OAuthClients oauthClients(AuthProperties properties, AppProperties app) {
			String redirectUri = app.url("/login/oauth2/code/{registrationId}");
			AuthProperties.Client google = properties.oauth().google();
			AuthProperties.Client github = properties.oauth().github();

			List<ClientRegistration> registrations = new ArrayList<>();
			if (google.isConfigured()) {
				registrations.add(CommonOAuth2Provider.GOOGLE.getBuilder("google")
						.clientId(google.clientId())
						.clientSecret(google.clientSecret())
						.redirectUri(redirectUri)
						.build());
			}
			if (github.isConfigured()) {
				registrations.add(CommonOAuth2Provider.GITHUB.getBuilder("github")
						.clientId(github.clientId())
						.clientSecret(github.clientSecret())
						.redirectUri(redirectUri)
						.scope("read:user", "user:email")
						.build());
			}
			return new OAuthClients(registrations);
		}
	}
}
