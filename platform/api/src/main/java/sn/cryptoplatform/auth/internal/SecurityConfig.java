package sn.cryptoplatform.auth.internal;

import java.nio.charset.StandardCharsets;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.csrf.CsrfException;

/**
 * API sans session : JWT en cookie httpOnly (ou en-tête Authorization), CSRF par double
 * soumission (cookie XSRF-TOKEN lisible par le site + en-tête X-XSRF-TOKEN), tout fermé par défaut.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig {

	private static final String[] PUBLIC_AUTH_POSTS = { "/api/auth/register", "/api/auth/login", "/api/auth/refresh",
			"/api/auth/logout", "/api/auth/verify-email", "/api/auth/verify-email/resend", "/api/auth/password/forgot",
			"/api/auth/password/reset" };

	@Bean
	SecurityFilterChain apiSecurityFilterChain(HttpSecurity http, OAuthClients oauthClients,
			GitHubEmailUserService oauthUserService, OAuthLoginHandler oauthLoginHandler) throws Exception {
		HttpStatusEntryPoint unauthorized = new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED);

		http
				// Le rafraîchissement n'agit que via le cookie SameSite=Lax, jamais envoyé par un POST
				// venu d'un autre site ; l'exempter permet au serveur Next.js de rafraîchir la session.
				.csrf(csrf -> csrf.spa().ignoringRequestMatchers("/api/auth/refresh"))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.formLogin(AbstractHttpConfigurer::disable)
				.httpBasic(AbstractHttpConfigurer::disable)
				.logout(AbstractHttpConfigurer::disable)
				.headers(headers -> headers
						.contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'none'; frame-ancestors 'none'"))
						.frameOptions(frame -> frame.deny()))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/actuator/health/**", "/actuator/info").permitAll()
						.requestMatchers("/api/public/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/auth/csrf", "/api/auth/providers").permitAll()
						.requestMatchers(HttpMethod.POST, PUBLIC_AUTH_POSTS).permitAll()
						.requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
						// Refusé avant même la lecture du corps (envois de fichiers volumineux).
						.requestMatchers("/api/studio/**").hasAnyRole("CREATOR", "ADMIN")
						.anyRequest().authenticated())
				.oauth2ResourceServer(resourceServer -> resourceServer
						.bearerTokenResolver(new CookieBearerTokenResolver())
						.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
						.authenticationEntryPoint(unauthorized))
				.exceptionHandling(exceptions -> exceptions
						.authenticationEntryPoint(unauthorized)
						.accessDeniedHandler(problemAccessDeniedHandler()));

		if (!oauthClients.isEmpty()) {
			http.oauth2Login(oauth -> oauth
					.clientRegistrationRepository(oauthClients)
					.loginPage("/connexion")
					.userInfoEndpoint(userInfo -> userInfo.userService(oauthUserService))
					.successHandler(oauthLoginHandler)
					.failureHandler(oauthLoginHandler));
		}
		return http.build();
	}

	/** Rôles du claim {@code roles} -> autorités ROLE_ADMIN, ROLE_MEMBER… (utilisables avec @PreAuthorize). */
	private static JwtAuthenticationConverter jwtAuthenticationConverter() {
		JwtGrantedAuthoritiesConverter authorities = new JwtGrantedAuthoritiesConverter();
		authorities.setAuthoritiesClaimName("roles");
		authorities.setAuthorityPrefix("ROLE_");
		JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
		converter.setJwtGrantedAuthoritiesConverter(authorities);
		return converter;
	}

	/** 403 au format problem+json ; le code CSRF_INVALID indique au site de recharger le jeton CSRF. */
	private static AccessDeniedHandler problemAccessDeniedHandler() {
		return (request, response, exception) -> {
			boolean csrf = exception instanceof CsrfException;
			response.setStatus(HttpStatus.FORBIDDEN.value());
			response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
			response.setCharacterEncoding(StandardCharsets.UTF_8.name());
			response.getWriter().write(csrf
					? "{\"status\":403,\"code\":\"CSRF_INVALID\",\"detail\":\"Jeton CSRF manquant ou invalide.\"}"
					: "{\"status\":403,\"code\":\"FORBIDDEN\",\"detail\":\"Accès refusé.\"}");
		};
	}
}
