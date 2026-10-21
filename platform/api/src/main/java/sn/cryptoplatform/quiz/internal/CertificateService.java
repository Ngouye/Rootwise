package sn.cryptoplatform.quiz.internal;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.UUID;

import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.cryptoplatform.course.CourseDirectory;
import sn.cryptoplatform.course.CourseDirectory.ChapterRef;
import sn.cryptoplatform.course.CourseDirectory.CourseRef;
import sn.cryptoplatform.course.CourseLessonsCompleted;
import sn.cryptoplatform.shared.AppProperties;
import sn.cryptoplatform.user.UserAccount;
import sn.cryptoplatform.user.UserService;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

/**
 * Certificat délivré quand toutes les leçons sont terminées et tous les quiz réussis.
 * Le contenu signé est un JSON canonique (clés triées, sans espaces, textes uniquement) :
 * n'importe qui peut revérifier la signature Ed25519 avec la clé publique publiée.
 */
@Service
@Transactional(readOnly = true)
class CertificateService {

	private static final JsonMapper JSON = JsonMapper.builder().build();

	private final CertificateRepository certificates;
	private final SigningKeyRepository keys;
	private final CertificateSigner signer;
	private final QuizService quizzes;
	private final CourseDirectory courses;
	private final UserService users;
	private final AppProperties app;

	CertificateService(CertificateRepository certificates, SigningKeyRepository keys, CertificateSigner signer,
			QuizService quizzes, CourseDirectory courses, UserService users, AppProperties app) {
		this.certificates = certificates;
		this.keys = keys;
		this.signer = signer;
		this.quizzes = quizzes;
		this.courses = courses;
		this.users = users;
		this.app = app;
	}

	@ApplicationModuleListener
	void on(CourseLessonsCompleted event) {
		issueIfEligible(event.userId(), event.courseId());
	}

	@ApplicationModuleListener
	void on(QuizService.QuizPassed event) {
		issueIfEligible(event.userId(), event.courseId());
	}

	@Transactional
	Optional<Certificate> issueIfEligible(long userId, long courseId) {
		if (certificates.existsByUserIdAndCourseId(userId, courseId) || !courses.hasCompletedAllLessons(userId, courseId)) {
			return Optional.empty();
		}
		List<Long> chapterIds = courses.chapters(courseId).stream().map(ChapterRef::id).toList();
		if (!quizzes.allPassed(userId, chapterIds)) {
			return Optional.empty();
		}
		CourseRef course = courses.findCourse(courseId).orElseThrow();
		UserAccount holder = users.findById(userId).orElseThrow();

		UUID serial = UUID.randomUUID();
		Instant issuedAt = Instant.now().truncatedTo(ChronoUnit.SECONDS);
		Map<String, String> payload = new TreeMap<>(Map.of(
				"platform", app.name(),
				"serial", serial.toString(),
				"course", course.title(),
				"courseSlug", course.slug(),
				"holder", holder.displayName(),
				"holderUsername", holder.username(),
				"issuedAt", issuedAt.toString(),
				"version", "1"));
		String canonical = canonical(payload);
		byte[] signature = signer.sign(canonical.getBytes(StandardCharsets.UTF_8));
		return Optional.of(certificates.save(new Certificate(userId, courseId, serial, canonical, signature,
				signer.keyId(), issuedAt)));
	}

	/** Vérification publique : n'importe qui peut contrôler un certificat à partir de son numéro. */
	Optional<QuizViews.CertificateView> verify(UUID serial) {
		return certificates.findBySerial(serial).map(certificate -> {
			Map<String, String> payload = JSON.readValue(certificate.getPayload(), new TypeReference<TreeMap<String, String>>() {
			});
			String canonical = canonical(payload);
			byte[] publicKey = keys.findById(certificate.getSigningKeyId()).map(SigningKeyRecord::getPublicKey).orElse(null);
			boolean valid = publicKey != null && CertificateSigner.verify(canonical.getBytes(StandardCharsets.UTF_8),
					certificate.getSignature(), publicKey);
			return new QuizViews.CertificateView(serial.toString(), payload, canonical,
					Base64.getEncoder().encodeToString(certificate.getSignature()), CertificateSigner.ALGORITHM,
					certificate.getSigningKeyId(), publicKey == null ? null : CertificateSigner.toPem(publicKey), valid,
					certificate.getIssuedAt());
		});
	}

	List<QuizViews.MyCertificate> mine(long userId) {
		return certificates.findByUserIdOrderByIssuedAtDesc(userId).stream().map(this::toMine).toList();
	}

	Optional<QuizViews.MyCertificate> forCourse(long userId, long courseId) {
		return certificates.findByUserIdAndCourseId(userId, courseId).map(this::toMine);
	}

	private QuizViews.MyCertificate toMine(Certificate certificate) {
		String title = courses.findCourse(certificate.getCourseId()).map(CourseRef::title).orElse("—");
		return new QuizViews.MyCertificate(certificate.getSerial().toString(), certificate.getCourseId(), title,
				certificate.getIssuedAt());
	}

	/** JSON canonique : clés triées (TreeMap), aucun espace, textes uniquement. */
	static String canonical(Map<String, String> payload) {
		return JSON.writeValueAsString(new TreeMap<>(payload));
	}
}
