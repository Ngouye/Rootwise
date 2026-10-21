package sn.cryptoplatform.auth.internal;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * GitHub ne renvoie l'e-mail dans le profil que s'il est public, et sans dire s'il est vérifié.
 * On interroge donc /user/emails pour obtenir l'adresse principale vérifiée ({@code verified_email}).
 */
@Component
class GitHubEmailUserService extends DefaultOAuth2UserService {

	static final String VERIFIED_EMAIL = "verified_email";

	private final RestClient github = RestClient.create("https://api.github.com");

	@Override
	public OAuth2User loadUser(OAuth2UserRequest request) {
		OAuth2User user = super.loadUser(request);
		if (!"github".equals(request.getClientRegistration().getRegistrationId())) {
			return user;
		}
		List<Map<String, Object>> emails = github.get()
				.uri("/user/emails")
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + request.getAccessToken().getTokenValue())
				.header(HttpHeaders.ACCEPT, "application/vnd.github+json")
				.retrieve()
				.body(new ParameterizedTypeReference<>() {
				});
		String verified = emails == null ? null : emails.stream()
				.filter(email -> Boolean.TRUE.equals(email.get("primary")) && Boolean.TRUE.equals(email.get("verified")))
				.map(email -> (String) email.get("email"))
				.findFirst()
				.orElse(null);

		Map<String, Object> attributes = new HashMap<>(user.getAttributes());
		attributes.put(VERIFIED_EMAIL, verified);
		return new DefaultOAuth2User(user.getAuthorities(), attributes, "id");
	}
}
