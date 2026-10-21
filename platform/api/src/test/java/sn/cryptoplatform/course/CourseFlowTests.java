package sn.cryptoplatform.course;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import com.jayway.jsonpath.JsonPath;
import org.awaitility.Awaitility;
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
import sn.cryptoplatform.user.Role;
import sn.cryptoplatform.user.UserAccount;
import sn.cryptoplatform.user.UserService;

/** Parcours complet de l'e-learning, uniquement par l'API HTTP (comme le site). */
@IntegrationTest
class CourseFlowTests {

	private static final String PASSWORD = "phrase-de-passe-solide";
	private static final byte[] PDF = "%PDF-1.4\n% fiche de test\n".getBytes(StandardCharsets.US_ASCII);
	private static final AtomicInteger SEQUENCE = new AtomicInteger();

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
	void creatorPublishesACourseAndALearnerEarnsAVerifiableCertificate() throws Exception {
		TestSession creator = session("createur", Role.CREATOR);
		TestSession learner = session("apprenant");

		// Le créateur construit le cours : un chapitre, une leçon texte, une leçon PDF, un quiz.
		long courseId = id(creator.post("/api/studio/courses",
				"{\"title\":\"Hachage : de MD5 à SHA-3\",\"summary\":\"Les fonctions de hachage.\",\"level\":\"BEGINNER\"}"));
		long chapterId = id(creator.post("/api/studio/courses/" + courseId + "/chapters", "{\"title\":\"Bases\"}"), "$.chapters[0].id");
		creator.post("/api/studio/chapters/" + chapterId + "/lessons",
				"{\"title\":\"Définition\",\"type\":\"TEXT\",\"contentMd\":\"Une fonction de **hachage**…\",\"freePreview\":true}");
		long pdfId = id(creator.upload("memo.pdf", "PDF", PDF));
		MvcTestResult withPdf = creator.post("/api/studio/chapters/" + chapterId + "/lessons",
				"{\"title\":\"Fiche\",\"type\":\"PDF\",\"mediaId\":%d}".formatted(pdfId));
		assertThat(withPdf).hasStatusOk();
		long pdfLessonId = id(withPdf, "$.chapters[0].lessons[1].id");
		ok(creator.put("/api/studio/chapters/" + chapterId + "/quiz", """
				{"passScorePct":100,"maxAttempts":null,"questions":[{"kind":"SINGLE","promptMd":"SHA-256 produit…",
				"explanationMd":"256 bits = 32 octets.","points":1,
				"choices":[{"labelMd":"32 octets","correct":true},{"labelMd":"64 octets","correct":false}]}]}
				"""));
		assertThat(creator.post("/api/studio/courses/" + courseId + "/publish", "")).hasStatusOk();

		String slug = JsonPath.read(creator.get("/api/studio/courses/" + courseId).getResponse().getContentAsString(), "$.slug");
		assertThat(slug).isEqualTo("hachage-de-md5-a-sha-3");
		assertThat(TestSession.anonymous(mvc).get("/api/public/courses?q=sha")).hasStatusOk()
				.bodyJson().extractingPath("$[*].slug").asArray().contains(slug);

		// Sans inscription : aperçu gratuit oui, le reste non.
		assertThat(learner.get("/api/lessons/" + pdfLessonId)).hasStatus(HttpStatus.FORBIDDEN)
				.bodyJson().extractingPath("$.code").isEqualTo("NOT_ENROLLED");
		assertThat(learner.get("/api/lessons/" + pdfLessonId + "/media")).hasStatus(HttpStatus.FORBIDDEN);

		assertThat(learner.post("/api/courses/" + slug + "/enrollment", "")).hasStatusOk()
				.bodyJson().extractingPath("$.progressPct").isEqualTo(0);

		// Lecture partielle (Range), indispensable pour se déplacer dans une vidéo.
		MvcTestResult partial = learner.getRange("/api/lessons/" + pdfLessonId + "/media", "bytes=0-3");
		assertThat(partial).hasStatus(HttpStatus.PARTIAL_CONTENT);
		assertThat(partial.getResponse().getContentAsString()).isEqualTo("%PDF");
		assertThat(partial.getResponse().getHeader("Content-Range")).isEqualTo("bytes 0-3/" + PDF.length);
		assertThat(partial.getResponse().getContentType()).isEqualTo("application/pdf");

		// Le quiz ne révèle jamais la bonne réponse avant correction.
		MvcTestResult quiz = learner.get("/api/chapters/" + chapterId + "/quiz");
		String quizJson = quiz.getResponse().getContentAsString();
		assertThat(quizJson).doesNotContain("correct");
		long questionId = ((Number) JsonPath.read(quizJson, "$.questions[0].id")).longValue();
		List<Map<String, Object>> choices = JsonPath.read(quizJson, "$.questions[0].choices");
		long right = choiceId(choices, "32 octets");
		long wrong = choiceId(choices, "64 octets");

		MvcTestResult failed = learner.post("/api/chapters/" + chapterId + "/quiz/attempts", answer(questionId, wrong));
		assertThat(failed).hasStatusOk().bodyJson().extractingPath("$.passed").isEqualTo(false);
		assertThat(failed.getResponse().getContentAsString()).doesNotContain("32 octets");
		assertThat(JsonPath.<Object>read(failed.getResponse().getContentAsString(), "$.results[0].correctChoiceIds")).isNull();

		// Toutes les leçons terminées + quiz réussi -> certificat délivré (en asynchrone).
		for (long lessonId : lessonIds(learner, slug)) {
			assertThat(learner.put("/api/lessons/" + lessonId + "/progress", "{\"positionSeconds\":0,\"completed\":true}"))
					.hasStatus(HttpStatus.NO_CONTENT);
		}
		assertThat(learner.get("/api/courses/" + slug + "/progress")).bodyJson().extractingPath("$.progressPct").isEqualTo(100);
		assertThat(learner.post("/api/chapters/" + chapterId + "/quiz/attempts", answer(questionId, right)))
				.bodyJson().extractingPath("$.passed").isEqualTo(true);

		String serial = Awaitility.await().atMost(Duration.ofSeconds(15)).until(() -> {
			MvcTestResult certificate = learner.get("/api/quiz/courses/" + courseId + "/certificate");
			return certificate.getResponse().getStatus() == 200
					? JsonPath.<String>read(certificate.getResponse().getContentAsString(), "$.serial") : null;
		}, value -> value != null);

		MvcTestResult verified = TestSession.anonymous(mvc).get("/api/public/certificates/" + serial);
		assertThat(verified).hasStatusOk().bodyJson().extractingPath("$.valid").isEqualTo(true);
		assertThat(verified).bodyJson().extractingPath("$.payload.course").isEqualTo("Hachage : de MD5 à SHA-3");

		// Un certificat modifié en base ne passe plus la vérification de signature.
		jdbc.update("UPDATE certificates SET payload = jsonb_set(payload, '{holder}', '\"Mallory\"') WHERE serial = ?::uuid", serial);
		assertThat(TestSession.anonymous(mvc).get("/api/public/certificates/" + serial))
				.bodyJson().extractingPath("$.valid").isEqualTo(false);
	}

	@Test
	void membersCannotUseTheStudio() {
		TestSession member = session("membre");

		assertThat(member.post("/api/studio/courses", "{\"title\":\"X\",\"summary\":\"Y\",\"level\":\"BEGINNER\"}"))
				.hasStatus(HttpStatus.FORBIDDEN);
		assertThat(member.upload("memo.pdf", "PDF", PDF)).hasStatus(HttpStatus.FORBIDDEN);
	}

	@Test
	void uploadsAreCheckedAgainstTheirRealContent() {
		TestSession creator = session("createur", Role.CREATOR);

		assertThat(creator.upload("faux.pdf", "PDF", "<script>alert(1)</script>".getBytes(StandardCharsets.UTF_8)))
				.hasStatus(HttpStatus.BAD_REQUEST).bodyJson().extractingPath("$.code").isEqualTo("UNSUPPORTED_FILE");
		assertThat(creator.upload("fiche.pdf", "VIDEO", PDF))
				.hasStatus(HttpStatus.BAD_REQUEST).bodyJson().extractingPath("$.code").isEqualTo("UNSUPPORTED_FILE");
	}

	@Test
	void creatorsCanOnlyEditTheirOwnCourses() throws Exception {
		TestSession alice = session("alice", Role.CREATOR);
		TestSession bob = session("bob", Role.CREATOR);
		long courseId = id(alice.post("/api/studio/courses",
				"{\"title\":\"Cours d'Alice\",\"summary\":\"Privé.\",\"level\":\"EXPERT\"}"));

		assertThat(bob.get("/api/studio/courses/" + courseId)).hasStatus(HttpStatus.FORBIDDEN)
				.bodyJson().extractingPath("$.code").isEqualTo("NOT_COURSE_OWNER");
		assertThat(bob.post("/api/studio/courses/" + courseId + "/chapters", "{\"title\":\"Intrusion\"}"))
				.hasStatus(HttpStatus.FORBIDDEN);
		// Un brouillon n'apparaît pas au catalogue.
		assertThat(TestSession.anonymous(mvc).get("/api/public/courses?q=alice"))
				.bodyJson().extractingPath("$").asArray().isEmpty();
	}

	@Test
	void quizAttemptsAreLimitedAndAnswersRevealedAfterTheLastOne() throws Exception {
		TestSession creator = session("createur", Role.CREATOR);
		TestSession learner = session("apprenant");
		long courseId = id(creator.post("/api/studio/courses",
				"{\"title\":\"Quiz limité " + SEQUENCE.incrementAndGet() + "\",\"summary\":\"Test.\",\"level\":\"BEGINNER\"}"));
		long chapterId = id(creator.post("/api/studio/courses/" + courseId + "/chapters", "{\"title\":\"Unique\"}"), "$.chapters[0].id");
		creator.post("/api/studio/chapters/" + chapterId + "/lessons", "{\"title\":\"Texte\",\"type\":\"TEXT\",\"contentMd\":\"Contenu\"}");
		ok(creator.put("/api/studio/chapters/" + chapterId + "/quiz", """
				{"passScorePct":100,"maxAttempts":1,"questions":[{"kind":"MULTIPLE","promptMd":"Fonctions de hachage ?",
				"explanationMd":"AES est un chiffrement.","points":2,
				"choices":[{"labelMd":"SHA-256","correct":true},{"labelMd":"SHA-3","correct":true},{"labelMd":"AES","correct":false}]}]}
				"""));
		creator.post("/api/studio/courses/" + courseId + "/publish", "");
		String slug = JsonPath.read(creator.get("/api/studio/courses/" + courseId).getResponse().getContentAsString(), "$.slug");
		learner.post("/api/courses/" + slug + "/enrollment", "");

		String quizJson = learner.get("/api/chapters/" + chapterId + "/quiz").getResponse().getContentAsString();
		long questionId = ((Number) JsonPath.read(quizJson, "$.questions[0].id")).longValue();
		long sha256 = choiceId(JsonPath.read(quizJson, "$.questions[0].choices"), "SHA-256");

		// Une seule des deux bonnes réponses : faux (tout ou rien), et c'était le dernier essai.
		MvcTestResult last = learner.post("/api/chapters/" + chapterId + "/quiz/attempts", answer(questionId, sha256));
		assertThat(last).bodyJson().extractingPath("$.passed").isEqualTo(false);
		assertThat(last).bodyJson().extractingPath("$.revealed").isEqualTo(true);
		assertThat(last).bodyJson().extractingPath("$.results[0].correctChoiceIds").asArray().hasSize(2);

		assertThat(learner.post("/api/chapters/" + chapterId + "/quiz/attempts", answer(questionId, sha256)))
				.hasStatus(HttpStatus.CONFLICT).bodyJson().extractingPath("$.code").isEqualTo("NO_ATTEMPTS_LEFT");
	}

	@Test
	void youtubeLessonsEmbedTheVideoWithNotes() throws Exception {
		TestSession creator = session("createur", Role.CREATOR);
		TestSession learner = session("apprenant");
		long courseId = id(creator.post("/api/studio/courses",
				"{\"title\":\"RSA en vidéo " + SEQUENCE.incrementAndGet() + "\",\"summary\":\"Test.\",\"level\":\"BEGINNER\"}"));
		long chapterId = id(creator.post("/api/studio/courses/" + courseId + "/chapters", "{\"title\":\"Vidéos\"}"), "$.chapters[0].id");

		assertThat(creator.post("/api/studio/chapters/" + chapterId + "/lessons",
				"{\"title\":\"Autre site\",\"type\":\"YOUTUBE\",\"youtubeUrl\":\"https://vimeo.com/76979871\"}"))
				.hasStatus(HttpStatus.BAD_REQUEST).bodyJson().extractingPath("$.code").isEqualTo("INVALID_YOUTUBE_URL");

		MvcTestResult added = creator.post("/api/studio/chapters/" + chapterId + "/lessons", """
				{"title":"Chiffrement RSA","type":"YOUTUBE","youtubeUrl":"https://www.youtube.com/watch?v=Xlal_d4zyfo&t=42s",
				"contentMd":"Notes : l'exposant **public** e.","durationSeconds":1105,"freePreview":true}
				""");
		assertThat(added).hasStatusOk().bodyJson().extractingPath("$.chapters[0].lessons[0].youtubeId").isEqualTo("Xlal_d4zyfo");
		long lessonId = id(added, "$.chapters[0].lessons[0].id");
		ok(creator.put("/api/studio/lessons/" + lessonId, """
				{"title":"Chiffrement RSA","type":"YOUTUBE","youtubeUrl":"https://youtu.be/M7vOxKVLsVY?si=abc",
				"contentMd":"Notes : l'exposant **public** e.","durationSeconds":1140,"freePreview":true}
				"""));
		ok(creator.post("/api/studio/courses/" + courseId + "/publish", ""));

		MvcTestResult lesson = learner.get("/api/lessons/" + lessonId);
		assertThat(lesson).hasStatusOk().bodyJson().extractingPath("$.youtubeId").isEqualTo("M7vOxKVLsVY");
		assertThat(lesson).bodyJson().extractingPath("$.mediaUrl").isNull();
		assertThat(lesson).bodyJson().extractingPath("$.contentMd").isEqualTo("Notes : l'exposant **public** e.");
	}

	@Test
	void theCatalogShowsChaptersLessonsAndDurationComputedByTheDatabase() throws Exception {
		TestSession creator = session("createur", Role.CREATOR);
		String title = "Volumetrie" + SEQUENCE.incrementAndGet();
		long courseId = id(creator.post("/api/studio/courses", "{\"title\":\"" + title + "\",\"summary\":\"Test.\",\"level\":\"BEGINNER\"}"));
		long first = id(creator.post("/api/studio/courses/" + courseId + "/chapters", "{\"title\":\"Un\"}"), "$.chapters[0].id");
		long second = id(creator.post("/api/studio/courses/" + courseId + "/chapters", "{\"title\":\"Deux\"}"), "$.chapters[1].id");
		ok(creator.post("/api/studio/chapters/" + first + "/lessons", "{\"title\":\"A\",\"type\":\"TEXT\",\"contentMd\":\"a\",\"durationSeconds\":125}"));
		ok(creator.post("/api/studio/chapters/" + first + "/lessons", "{\"title\":\"B\",\"type\":\"TEXT\",\"contentMd\":\"b\"}"));
		ok(creator.post("/api/studio/chapters/" + second + "/lessons", "{\"title\":\"C\",\"type\":\"TEXT\",\"contentMd\":\"c\",\"durationSeconds\":60}"));
		ok(creator.post("/api/studio/courses/" + courseId + "/publish", ""));

		// 125 s + (sans durée) + 60 s = 185 s, arrondies à la minute supérieure.
		MvcTestResult catalog = TestSession.anonymous(mvc).get("/api/public/courses?q=" + title);
		assertThat(catalog).hasStatusOk().bodyJson().extractingPath("$[0].chapterCount").isEqualTo(2);
		assertThat(catalog).bodyJson().extractingPath("$[0].lessonCount").isEqualTo(3);
		assertThat(catalog).bodyJson().extractingPath("$[0].durationMinutes").isEqualTo(4);
	}

	@Test
	void onlyAdminsReassignACourseAndOnlyToACreator() throws Exception {
		TestSession alice = session("alice", Role.CREATOR);
		String bob = username(session("bob", Role.CREATOR));
		String member = username(session("membre"));
		TestSession admin = session("admin", Role.ADMIN);
		long courseId = id(alice.post("/api/studio/courses",
				"{\"title\":\"Cours transmis " + SEQUENCE.incrementAndGet() + "\",\"summary\":\"Test.\",\"level\":\"BEGINNER\"}"));
		String update = "{\"title\":\"Cours transmis\",\"summary\":\"Test.\",\"level\":\"BEGINNER\",\"authorUsername\":\"%s\"}";

		assertThat(alice.put("/api/studio/courses/" + courseId, update.formatted(bob)))
				.hasStatus(HttpStatus.FORBIDDEN).bodyJson().extractingPath("$.code").isEqualTo("ADMIN_ONLY");
		assertThat(admin.put("/api/studio/courses/" + courseId, update.formatted(member)))
				.hasStatus(HttpStatus.BAD_REQUEST).bodyJson().extractingPath("$.code").isEqualTo("INVALID_AUTHOR");
		assertThat(admin.put("/api/studio/courses/" + courseId, update.formatted(bob.toUpperCase())))
				.hasStatusOk().bodyJson().extractingPath("$.authorUsername").isEqualTo(bob);
		assertThat(alice.get("/api/studio/courses/" + courseId)).hasStatus(HttpStatus.FORBIDDEN);
	}

	private static String username(TestSession session) throws Exception {
		return JsonPath.read(session.get("/api/auth/me").getResponse().getContentAsString(), "$.username");
	}

	private TestSession session(String prefix, Role... roles) {
		String email = prefix + "-" + SEQUENCE.incrementAndGet() + "@exemple.sn";
		UserAccount account = users.registerWithPassword(email, prefix + SEQUENCE.get(), "Membre " + prefix,
				passwords.encode(PASSWORD));
		users.markEmailVerified(account.id());
		for (Role role : roles) {
			users.grantRole(account.id(), role);
		}
		return TestSession.login(mvc, email, PASSWORD);
	}

	private List<Long> lessonIds(TestSession session, String slug) throws Exception {
		String detail = session.get("/api/public/courses/" + slug).getResponse().getContentAsString();
		List<Number> ids = JsonPath.read(detail, "$.chapters[*].lessons[*].id");
		return ids.stream().map(Number::longValue).toList();
	}

	private static String answer(long questionId, long choiceId) {
		return "{\"answers\":[{\"questionId\":%d,\"choiceIds\":[%d]}]}".formatted(questionId, choiceId);
	}

	private static long choiceId(List<Map<String, Object>> choices, String label) {
		return choices.stream().filter(choice -> label.equals(choice.get("labelMd")))
				.map(choice -> ((Number) choice.get("id")).longValue()).findFirst().orElseThrow();
	}

	/** Statut 2xx attendu ; sinon le corps de la réponse (problem+json) s'affiche dans l'échec. */
	private static void ok(MvcTestResult result) throws Exception {
		assertThat(result.getResponse().getStatus()).as(result.getResponse().getContentAsString()).isBetween(200, 204);
	}

	private static long id(MvcTestResult result) throws Exception {
		return id(result, "$.id");
	}

	private static long id(MvcTestResult result, String path) throws Exception {
		assertThat(result.getResponse().getStatus()).as(result.getResponse().getContentAsString()).isBetween(200, 201);
		return ((Number) JsonPath.read(result.getResponse().getContentAsString(), path)).longValue();
	}
}
