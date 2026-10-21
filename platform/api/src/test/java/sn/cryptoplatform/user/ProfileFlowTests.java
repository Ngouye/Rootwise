package sn.cryptoplatform.user;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.assertj.MvcTestResult;

import sn.cryptoplatform.IntegrationTest;
import sn.cryptoplatform.TestSession;

/** Profil public des formateurs : photo, titre et présentation, visibles sur leurs cours. */
@IntegrationTest
class ProfileFlowTests {

	private static final String PASSWORD = "phrase-de-passe-solide";
	private static final AtomicInteger SEQUENCE = new AtomicInteger();
	/** Image PNG valide de 1 × 1 pixel. */
	private static final byte[] PNG = Base64.getDecoder()
			.decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");

	@Autowired
	MockMvcTester mvc;

	@Autowired
	UserService users;

	@Autowired
	PasswordEncoder passwords;

	@Autowired
	JdbcTemplate jdbc;

	@BeforeEach
	void resetRateLimits() {
		jdbc.update("TRUNCATE rate_limit_counters");
	}

	@Test
	void aTeacherSetsAPhotoAndAHeadlineShownOnTheirCourses() throws Exception {
		String username = "formateur" + SEQUENCE.incrementAndGet();
		TestSession teacher = session(username, Role.CREATOR);

		MvcTestResult updated = teacher.put("/api/me/profile",
				"{\"displayName\":\"Awa Ndiaye\",\"headline\":\"Ingénieure sécurité\",\"bio\":\"Dix ans de PKI.\"}");
		assertThat(updated).hasStatusOk();
		assertThat(json(updated, "$.headline")).isEqualTo("Ingénieure sécurité");

		MvcTestResult avatar = teacher.uploadFile("/api/me/avatar", "moi.png", PNG);
		assertThat(avatar).hasStatusOk();
		String avatarUrl = json(avatar, "$.avatarUrl");
		assertThat(avatarUrl).startsWith("/api/public/media/");
		assertThat(TestSession.anonymous(mvc).get(avatarUrl)).hasStatusOk().hasContentType("image/png");

		// Profil public : sans e-mail.
		MvcTestResult profile = TestSession.anonymous(mvc).get("/api/public/users/" + username);
		assertThat(profile).hasStatusOk();
		assertThat(json(profile, "$.avatarUrl")).isEqualTo(avatarUrl);
		assertThat(profile.getResponse().getContentAsString()).doesNotContain("@exemple.sn");
		assertThat(json(teacher.get("/api/auth/me"), "$.avatarUrl")).isEqualTo(avatarUrl);

		// L'auteur d'un cours publié est présenté avec sa photo et son titre.
		long courseId = ((Number) JsonPath.read(teacher.post("/api/studio/courses",
				"{\"title\":\"PKI en pratique\",\"summary\":\"Certificats X.509.\",\"level\":\"BEGINNER\"}")
				.getResponse().getContentAsString(), "$.id")).longValue();
		long chapterId = ((Number) JsonPath.read(teacher.post("/api/studio/courses/" + courseId + "/chapters", "{\"title\":\"Bases\"}")
				.getResponse().getContentAsString(), "$.chapters[0].id")).longValue();
		teacher.post("/api/studio/chapters/" + chapterId + "/lessons", "{\"title\":\"Définition\",\"type\":\"TEXT\",\"contentMd\":\"Un certificat…\"}");
		assertThat(teacher.post("/api/studio/courses/" + courseId + "/publish", "")).hasStatusOk();
		String catalog = TestSession.anonymous(mvc).get("/api/public/courses").getResponse().getContentAsString();
		List<String> headlines = JsonPath.read(catalog, "$[?(@.id == %d)].author.headline".formatted(courseId));
		List<String> avatars = JsonPath.read(catalog, "$[?(@.id == %d)].author.avatarUrl".formatted(courseId));
		assertThat(headlines).containsExactly("Ingénieure sécurité");
		assertThat(avatars).containsExactly(avatarUrl);

		assertThat(teacher.delete("/api/me/avatar")).hasStatusOk();
		assertThat(json(teacher.get("/api/auth/me"), "$.avatarUrl")).isNull();
	}

	@Test
	void onlyRealImagesBecomeAvatarsAndOnlyForTheirOwner() {
		TestSession member = session("membre" + SEQUENCE.incrementAndGet());

		assertThat(member.uploadFile("/api/me/avatar", "photo.png", "<svg onload=alert(1)>".getBytes(StandardCharsets.UTF_8)))
				.hasStatus4xxClientError();
		assertThat(member.put("/api/me/profile", "{\"displayName\":\"x\"}")).hasStatus(HttpStatus.BAD_REQUEST);
		assertThat(TestSession.anonymous(mvc).put("/api/me/profile", "{\"displayName\":\"Pirate\"}")).hasStatus(HttpStatus.UNAUTHORIZED);
		assertThat(TestSession.anonymous(mvc).get("/api/public/users/inconnu-" + SEQUENCE.incrementAndGet()))
				.hasStatus(HttpStatus.NOT_FOUND);
	}

	private TestSession session(String username, Role... roles) {
		String email = username + "@exemple.sn";
		UserAccount account = users.registerWithPassword(email, username, "Membre " + username, passwords.encode(PASSWORD));
		users.markEmailVerified(account.id());
		for (Role role : roles) {
			users.grantRole(account.id(), role);
		}
		return TestSession.login(mvc, email, PASSWORD);
	}

	private static String json(MvcTestResult result, String path) throws Exception {
		return JsonPath.read(result.getResponse().getContentAsString(), path);
	}
}
