package sn.cryptoplatform.quiz.internal;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import sn.cryptoplatform.shared.security.CurrentUser;
import sn.cryptoplatform.shared.web.ApiException;

@RestController
class QuizController {

	record Answer(@NotNull long questionId, @Size(max = 8) List<Long> choiceIds) {
	}

	record AttemptRequest(@NotNull @Size(max = 30) List<@Valid Answer> answers) {
	}

	private final QuizService quizzes;
	private final CertificateService certificates;

	QuizController(QuizService quizzes, CertificateService certificates) {
		this.quizzes = quizzes;
		this.certificates = certificates;
	}

	@GetMapping("/api/chapters/{chapterId}/quiz")
	QuizViews.LearnerQuiz quiz(@PathVariable long chapterId) {
		return quizzes.learnerView(CurrentUser.id(), chapterId);
	}

	@PostMapping("/api/chapters/{chapterId}/quiz/attempts")
	QuizViews.AttemptResult submit(@PathVariable long chapterId, @Valid @RequestBody AttemptRequest body) {
		return quizzes.submit(CurrentUser.id(), chapterId, QuizService.toAnswerMap(body.answers()));
	}

	@GetMapping("/api/quiz/courses/{courseId}/status")
	List<QuizViews.ChapterStatus> statuses(@PathVariable long courseId) {
		return quizzes.statuses(CurrentUser.id(), courseId);
	}

	@GetMapping("/api/quiz/courses/{courseId}/certificate")
	QuizViews.MyCertificate myCertificate(@PathVariable long courseId) {
		return certificates.forCourse(CurrentUser.id(), courseId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CERTIFICATE_NOT_FOUND", "Pas encore de certificat."));
	}

	@GetMapping("/api/me/certificates")
	List<QuizViews.MyCertificate> myCertificates() {
		return certificates.mine(CurrentUser.id());
	}

	/** Programme public d'un cours : quels chapitres se terminent par un quiz. */
	@GetMapping("/api/public/quizzes")
	List<QuizViews.PublicQuizInfo> publicInfo(@RequestParam long courseId) {
		return quizzes.publicInfo(courseId);
	}

	@GetMapping("/api/public/certificates/{serial}")
	QuizViews.CertificateView verify(@PathVariable String serial) {
		UUID parsed;
		try {
			parsed = UUID.fromString(serial);
		} catch (IllegalArgumentException e) {
			throw new ApiException(HttpStatus.NOT_FOUND, "CERTIFICATE_NOT_FOUND", "Certificat introuvable.");
		}
		return certificates.verify(parsed)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CERTIFICATE_NOT_FOUND", "Certificat introuvable."));
	}
}
