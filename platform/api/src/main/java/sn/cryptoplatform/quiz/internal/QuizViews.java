package sn.cryptoplatform.quiz.internal;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import sn.cryptoplatform.quiz.QuizAuthoring.QuestionKind;

/** Réponses JSON du module quiz. Côté membre, jamais l'indication des bonnes réponses avant correction. */
final class QuizViews {

	private QuizViews() {
	}

	record ChoiceView(long id, String labelMd) {
	}

	record QuestionView(long id, QuestionKind kind, String promptMd, int points, List<ChoiceView> choices) {
	}

	record LearnerQuiz(long quizId, long chapterId, String chapterTitle, long courseId, int passScorePct,
			Integer maxAttempts, int attemptsUsed, Integer bestScorePct, boolean passed, List<QuestionView> questions) {
	}

	/** {@code correctChoiceIds} et {@code explanationMd} ne sont remplis que si les réponses sont révélées. */
	record QuestionResult(long questionId, boolean correct, List<Long> correctChoiceIds, String explanationMd) {
	}

	record AttemptResult(int scorePct, boolean passed, int attemptsUsed, Integer maxAttempts, boolean revealed,
			List<QuestionResult> results) {
	}

	record ChapterStatus(long chapterId, int questionCount, boolean passed, Integer bestScorePct, int attemptsUsed,
			Integer maxAttempts) {
	}

	record PublicQuizInfo(long chapterId, int questionCount) {
	}

	record StudioChoice(String labelMd, boolean correct) {
	}

	record StudioQuestion(QuestionKind kind, String promptMd, String explanationMd, int points, List<StudioChoice> choices) {
	}

	record StudioQuiz(long chapterId, int passScorePct, Integer maxAttempts, List<StudioQuestion> questions) {
	}

	record CertificateView(String serial, Map<String, String> payload, String canonicalPayload, String signatureBase64,
			String algorithm, String keyId, String publicKeyPem, boolean valid, Instant issuedAt) {
	}

	record MyCertificate(String serial, long courseId, String courseTitle, Instant issuedAt) {
	}
}
