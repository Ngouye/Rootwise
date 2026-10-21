package sn.cryptoplatform.auth.internal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.stream.Stream;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.assertj.MvcTestResult;

import sn.cryptoplatform.CapturingMailSender;
import sn.cryptoplatform.IntegrationTest;
import sn.cryptoplatform.user.UserAccount;
import sn.cryptoplatform.user.UserService;

@IntegrationTest
class AuthFlowTests {

	private static final String PASSWORD = "phrase-de-passe-solide";

	@Autowired
	MockMvcTester mvc;

	@Autowired
	CapturingMailSender mail;

	@Autowired
	JdbcTemplate jdbc;

	@Autowired
	UserService users;

	@Autowired
	OAuthAccountService oauthAccounts;

	@BeforeEach
	void resetRateLimitsAndMailbox() {
		jdbc.update("TRUNCATE rate_limit_counters");
		mail.clear();
	}

	@Test
	void emailMustBeVerifiedBeforePasswordLogin() throws Exception {
		assertThat(register("alice@exemple.sn", "alice")).hasStatus(HttpStatus.ACCEPTED);

		assertThat(login("alice@exemple.sn", PASSWORD)).hasStatus(HttpStatus.FORBIDDEN)
				.bodyJson().extractingPath("$.code").isEqualTo("EMAIL_NOT_VERIFIED");

		String token = mail.awaitToken("alice@exemple.sn", "/verifier-email");
		MvcTestResult verified = post("/api/auth/verify-email", "{\"token\":\"%s\"}".formatted(token));
		assertThat(verified).hasStatusOk().bodyJson().extractingPath("$.username").isEqualTo("alice");
		Cookie access = verified.getResponse().getCookie(AuthCookies.ACCESS);
		assertThat(access).isNotNull();
		assertThat(access.isHttpOnly()).isTrue();
		assertThat(access.getSecure()).isTrue();

		MvcTestResult me = mvc.get().uri("/api/auth/me").cookie(access).exchange();
		assertThat(me).hasStatusOk().bodyJson().extractingPath("$.email").isEqualTo("alice@exemple.sn");
		assertThat(me.getResponse().getContentAsString()).doesNotContain("password", "tokenVersion");

		assertThat(post("/api/auth/verify-email", "{\"token\":\"%s\"}".formatted(token)))
				.hasStatus(HttpStatus.BAD_REQUEST).bodyJson().extractingPath("$.code").isEqualTo("INVALID_TOKEN");
	}

	@Test
	void wrongPasswordAndUnknownEmailGetTheSameAnswer() throws Exception {
		createVerifiedMember("bob@exemple.sn", "bob");

		MvcTestResult wrongPassword = login("bob@exemple.sn", "mauvais-mot-de-passe");
		MvcTestResult unknownEmail = login("personne@exemple.sn", PASSWORD);

		assertThat(wrongPassword).hasStatus(HttpStatus.UNAUTHORIZED);
		assertThat(unknownEmail).hasStatus(HttpStatus.UNAUTHORIZED);
		assertThat(wrongPassword.getResponse().getContentAsString())
				.isEqualTo(unknownEmail.getResponse().getContentAsString());
	}

	@Test
	void registeringAnExistingEmailLooksIdenticalAndOnlyNotifiesTheOwner() {
		createVerifiedMember("carole@exemple.sn", "carole");

		assertThat(register("carole@exemple.sn", "imposteur")).hasStatus(HttpStatus.ACCEPTED);

		assertThat(mail.awaitMessage("carole@exemple.sn", "déjà associée").getSubject()).contains("Tentative d'inscription");
		assertThat(users.isUsernameTaken("imposteur")).isFalse();
		assertThat(register("autre@exemple.sn", "CAROLE")).hasStatus(HttpStatus.CONFLICT)
				.bodyJson().extractingPath("$.code").isEqualTo("USERNAME_TAKEN");
	}

	@Test
	void refreshRotatesTokensAndReuseRevokesTheWholeFamily() {
		Cookie[] first = createVerifiedMember("david@exemple.sn", "david");

		MvcTestResult rotated = post("/api/auth/refresh", "", refreshCookie(first));
		assertThat(rotated).hasStatusOk();
		Cookie second = rotated.getResponse().getCookie(AuthCookies.REFRESH);
		assertThat(second.getValue()).isNotEqualTo(refreshCookie(first).getValue());

		// L'ancien jeton rejoué après le délai de grâce : vol présumé.
		jdbc.update("UPDATE refresh_tokens SET rotated_at = now() - interval '5 minutes' WHERE rotated_at IS NOT NULL");
		MvcTestResult replay = post("/api/auth/refresh", "", refreshCookie(first));
		assertThat(replay).hasStatus(HttpStatus.UNAUTHORIZED);
		assertThat(replay.getResponse().getCookie(AuthCookies.REFRESH).getMaxAge()).isZero();

		assertThat(post("/api/auth/refresh", "", second)).hasStatus(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void concurrentRefreshWithinTheGracePeriodIsNotTreatedAsTheft() {
		Cookie[] session = createVerifiedMember("eve@exemple.sn", "eve");

		assertThat(post("/api/auth/refresh", "", refreshCookie(session))).hasStatusOk();
		assertThat(post("/api/auth/refresh", "", refreshCookie(session))).hasStatusOk();
	}

	@Test
	void logoutRevokesTheRefreshToken() {
		Cookie[] session = createVerifiedMember("fatou@exemple.sn", "fatou");

		assertThat(post("/api/auth/logout", "", session)).hasStatus(HttpStatus.NO_CONTENT);
		assertThat(post("/api/auth/refresh", "", refreshCookie(session))).hasStatus(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void passwordResetClosesEveryOpenSession() {
		Cookie[] session = createVerifiedMember("gora@exemple.sn", "gora");

		assertThat(post("/api/auth/password/forgot", "{\"email\":\"gora@exemple.sn\"}")).hasStatus(HttpStatus.ACCEPTED);
		assertThat(post("/api/auth/password/forgot", "{\"email\":\"inconnu@exemple.sn\"}")).hasStatus(HttpStatus.ACCEPTED);
		String token = mail.awaitToken("gora@exemple.sn", "/reinitialiser-mot-de-passe");

		String newPassword = "nouvelle-phrase-de-passe";
		assertThat(post("/api/auth/password/reset", "{\"token\":\"%s\",\"password\":\"%s\"}".formatted(token, newPassword)))
				.hasStatus(HttpStatus.NO_CONTENT);

		assertThat(mvc.get().uri("/api/auth/me").cookie(session)).hasStatus(HttpStatus.UNAUTHORIZED);
		assertThat(post("/api/auth/refresh", "", refreshCookie(session))).hasStatus(HttpStatus.UNAUTHORIZED);
		assertThat(login("gora@exemple.sn", PASSWORD)).hasStatus(HttpStatus.UNAUTHORIZED);
		assertThat(login("gora@exemple.sn", newPassword)).hasStatusOk();
	}

	@Test
	void repeatedLoginFailuresAreRateLimited() {
		createVerifiedMember("hawa@exemple.sn", "hawa");
		for (int attempt = 0; attempt < 10; attempt++) {
			assertThat(login("hawa@exemple.sn", "tentative-" + attempt)).hasStatus(HttpStatus.UNAUTHORIZED);
		}

		MvcTestResult blocked = login("hawa@exemple.sn", PASSWORD);
		assertThat(blocked).hasStatus(HttpStatus.TOO_MANY_REQUESTS)
				.bodyJson().extractingPath("$.code").isEqualTo("RATE_LIMITED");
		assertThat(blocked.getResponse().getHeader("Retry-After")).isNotBlank();
	}

	@Test
	void passwordResetRequestsAreRateLimitedPerAddressInsideATransaction() {
		// requestReset est transactionnel : les compteurs doivent tout de même être validés à part.
		for (int attempt = 0; attempt < 3; attempt++) {
			assertThat(post("/api/auth/password/forgot", "{\"email\":\"Lamine@Exemple.sn\"}")).hasStatus(HttpStatus.ACCEPTED);
		}
		assertThat(post("/api/auth/password/forgot", "{\"email\":\"lamine@exemple.sn\"}"))
				.hasStatus(HttpStatus.TOO_MANY_REQUESTS)
				.bodyJson().extractingPath("$.code").isEqualTo("RATE_LIMITED");
		assertThat(jdbc.queryForObject("SELECT count(*) FROM rate_limit_counters WHERE counter_key LIKE 'reset:email:%'", Long.class))
				.isEqualTo(1L);
	}

	@Test
	void mutatingRequestsRequireTheCsrfToken() {
		String login = "{\"email\":\"x@exemple.sn\",\"password\":\"%s\"}".formatted(PASSWORD);

		assertThat(mvc.post().uri("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(login))
				.hasStatus(HttpStatus.FORBIDDEN).bodyJson().extractingPath("$.code").isEqualTo("CSRF_INVALID");

		// Double soumission, comme le fera le site : cookie XSRF-TOKEN renvoyé dans l'en-tête.
		Cookie xsrf = mvc.get().uri("/api/auth/csrf").exchange().getResponse().getCookie("XSRF-TOKEN");
		assertThat(xsrf).isNotNull();
		assertThat(mvc.post().uri("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(login)
				.cookie(xsrf).header("X-XSRF-TOKEN", xsrf.getValue()))
				.hasStatus(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void githubLoginRedirectsToGitHubWithOurPublicCallback() {
		MvcTestResult result = mvc.get().uri("/oauth2/authorization/github").exchange();

		assertThat(result).hasStatus3xxRedirection();
		assertThat(result.getResponse().getRedirectedUrl())
				.startsWith("https://github.com/login/oauth/authorize")
				.contains("client_id=test-github-client")
				.contains("redirect_uri=http://localhost:3000/login/oauth2/code/github");
		assertThat(mvc.get().uri("/api/auth/providers")).hasStatusOk().bodyJson().isStrictlyEqualTo("[\"github\"]");
	}

	@Test
	void oauthLoginTakesOverAnUnverifiedAccountRegisteredByAThirdParty() {
		// Un tiers inscrit l'adresse de la victime avec son propre mot de passe, sans pouvoir la vérifier.
		register("victime@exemple.sn", "pirate");
		long accountId = users.findByEmail("victime@exemple.sn").orElseThrow().id();

		UserAccount account = oauthAccounts.loginOrRegister(new ExternalIdentity(OAuthAccount.Provider.GITHUB, "4242",
				"victime@exemple.sn", true, "Victime", "victime"));

		assertThat(account.id()).isEqualTo(accountId);
		assertThat(account.emailVerified()).isTrue();
		assertThat(account.tokenVersion()).isEqualTo(1);
		assertThat(users.findPasswordHash(accountId)).isEmpty();
		assertThat(oauthAccounts.loginOrRegister(new ExternalIdentity(OAuthAccount.Provider.GITHUB, "4242",
				"autre-adresse@exemple.sn", true, "Victime", "victime")).id()).isEqualTo(accountId);
	}

	@Test
	void oauthCreatesVerifiedAccountsButRefusesUnverifiedEmails() {
		createVerifiedMember("ibra@exemple.sn", "ibra");

		UserAccount created = oauthAccounts.loginOrRegister(new ExternalIdentity(OAuthAccount.Provider.GOOGLE,
				"google-1", "ibra.nouveau@exemple.sn", true, "Ibra", "ibra"));
		assertThat(created.emailVerified()).isTrue();
		assertThat(created.username()).matches("ibra-\\d{4}");

		assertThatThrownBy(() -> oauthAccounts.loginOrRegister(new ExternalIdentity(OAuthAccount.Provider.GITHUB,
				"99", "non.verifiee@exemple.sn", false, "X", "x")))
				.isInstanceOf(OAuthAccountService.UnverifiedEmailException.class);
	}

	private Cookie[] createVerifiedMember(String email, String username) {
		assertThat(register(email, username)).hasStatus(HttpStatus.ACCEPTED);
		String token = mail.awaitToken(email, "/verifier-email");
		MvcTestResult verified = post("/api/auth/verify-email", "{\"token\":\"%s\"}".formatted(token));
		assertThat(verified).hasStatusOk();
		return new Cookie[] { verified.getResponse().getCookie(AuthCookies.ACCESS),
				verified.getResponse().getCookie(AuthCookies.REFRESH) };
	}

	private MvcTestResult register(String email, String username) {
		return post("/api/auth/register", """
				{"email":"%s","username":"%s","displayName":"Membre %s","password":"%s"}
				""".formatted(email, username, username, PASSWORD));
	}

	private MvcTestResult login(String email, String password) {
		return post("/api/auth/login", "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password));
	}

	/** POST tel que l'envoie le site : cookie XSRF-TOKEN renvoyé dans l'en-tête X-XSRF-TOKEN. */
	private MvcTestResult post(String path, String json, Cookie... cookies) {
		Cookie xsrf = mvc.get().uri("/api/auth/csrf").exchange().getResponse().getCookie("XSRF-TOKEN");
		var request = mvc.post().uri(path)
				.header("X-XSRF-TOKEN", xsrf.getValue())
				.cookie(Stream.concat(Stream.of(cookies), Stream.of(xsrf)).toArray(Cookie[]::new));
		if (!json.isEmpty()) {
			request = request.contentType(MediaType.APPLICATION_JSON).content(json);
		}
		return request.exchange();
	}

	private static Cookie refreshCookie(Cookie[] session) {
		return session[1];
	}
}
