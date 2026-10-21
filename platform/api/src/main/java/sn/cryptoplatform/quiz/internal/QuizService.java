package sn.cryptoplatform.quiz.internal;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.cryptoplatform.course.CourseDirectory;
import sn.cryptoplatform.course.CourseDirectory.ChapterRef;
import sn.cryptoplatform.course.CourseDirectory.CourseRef;
import sn.cryptoplatform.quiz.QuizAuthoring;
import sn.cryptoplatform.shared.web.ApiException;

@Service
@Transactional(readOnly = true)
class QuizService implements QuizAuthoring {

	/** Un quiz réussi : le module vérifie alors si un certificat peut être délivré. */
	record QuizPassed(long userId, long courseId) {
	}

	private final QuizRepository quizzes;
	private final QuizAttemptRepository attempts;
	private final CourseDirectory courses;
	private final ApplicationEventPublisher events;

	QuizService(QuizRepository quizzes, QuizAttemptRepository attempts, CourseDirectory courses,
			ApplicationEventPublisher events) {
		this.quizzes = quizzes;
		this.attempts = attempts;
		this.courses = courses;
		this.events = events;
	}

	// ---------- Studio ----------

	@Override
	@Transactional
	public void saveQuiz(long chapterId, QuizDraft draft) {
		chapter(chapterId);
		validate(draft);
		Quiz quiz = quizzes.findByChapterId(chapterId).orElseGet(() -> new Quiz(chapterId));
		quiz.replace(draft);
		quizzes.save(quiz);
	}

	@Transactional
	void deleteQuiz(long chapterId) {
		quizzes.findByChapterId(chapterId).ifPresent(quizzes::delete);
	}

	QuizViews.StudioQuiz studioView(long chapterId) {
		Quiz quiz = quizOf(chapterId);
		return new QuizViews.StudioQuiz(chapterId, quiz.getPassScorePct(),
				quiz.getMaxAttempts() == null ? null : quiz.getMaxAttempts().intValue(),
				quiz.getQuestions().stream()
						.map(question -> new QuizViews.StudioQuestion(question.getKind(), question.getPromptMd(),
								question.getExplanationMd(), question.getPoints(), question.getChoices().stream()
										.map(choice -> new QuizViews.StudioChoice(choice.getLabelMd(), choice.isCorrect()))
										.toList()))
						.toList());
	}

	ChapterRef chapter(long chapterId) {
		return courses.findChapter(chapterId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CHAPTER_NOT_FOUND", "Chapitre introuvable."));
	}

	// ---------- Membre ----------

	QuizViews.LearnerQuiz learnerView(long userId, long chapterId) {
		ChapterRef chapter = readableChapter(userId, chapterId);
		Quiz quiz = quizOf(chapterId);
		Short best = attempts.bestScore(quiz.getId(), userId);
		return new QuizViews.LearnerQuiz(quiz.getId(), chapterId, chapter.title(), chapter.courseId(),
				quiz.getPassScorePct(), quiz.getMaxAttempts() == null ? null : quiz.getMaxAttempts().intValue(),
				attempts.countByQuizIdAndUserId(quiz.getId(), userId), best == null ? null : best.intValue(),
				attempts.existsByQuizIdAndUserIdAndPassedTrue(quiz.getId(), userId),
				quiz.getQuestions().stream()
						.map(question -> new QuizViews.QuestionView(question.getId(), question.getKind(),
								question.getPromptMd(), question.getPoints(), question.getChoices().stream()
										.map(choice -> new QuizViews.ChoiceView(choice.getId(), choice.getLabelMd()))
										.toList()))
						.toList());
	}

	/**
	 * Correction côté serveur : une question est juste si les choix cochés sont exactement les
	 * bonnes réponses. Les corrigés ne sont révélés qu'une fois le quiz réussi ou les essais épuisés.
	 */
	@Transactional
	QuizViews.AttemptResult submit(long userId, long chapterId, Map<Long, Set<Long>> answers) {
		ChapterRef chapter = readableChapter(userId, chapterId);
		if (!courses.isEnrolled(userId, chapter.courseId())) {
			throw ApiException.forbidden("NOT_ENROLLED", "Inscrivez-vous au cours pour passer ce quiz.");
		}
		Quiz quiz = quizOf(chapterId);
		int used = attempts.countByQuizIdAndUserId(quiz.getId(), userId);
		Integer max = quiz.getMaxAttempts() == null ? null : quiz.getMaxAttempts().intValue();
		if (max != null && used >= max) {
			throw ApiException.conflict("NO_ATTEMPTS_LEFT", "Vous avez utilisé toutes vos tentatives pour ce quiz.");
		}

		int earned = 0;
		Set<QuizAttempt.Answer> recorded = new HashSet<>();
		Map<Long, Boolean> correctness = new java.util.LinkedHashMap<>();
		for (QuizQuestion question : quiz.getQuestions()) {
			Set<Long> selected = new HashSet<>(answers.getOrDefault(question.getId(), Set.of()));
			selected.retainAll(question.choiceIds());
			boolean correct = selected.equals(question.correctChoiceIds());
			correctness.put(question.getId(), correct);
			if (correct) {
				earned += question.getPoints();
			}
			selected.forEach(choiceId -> recorded.add(new QuizAttempt.Answer(question.getId(), choiceId)));
		}
		int total = quiz.totalPoints();
		int score = total == 0 ? 0 : Math.round(100f * earned / total);
		boolean passed = score >= quiz.getPassScorePct();
		attempts.save(new QuizAttempt(quiz.getId(), userId, recorded, score, passed));

		int usedNow = used + 1;
		boolean revealed = passed || (max != null && usedNow >= max);
		if (passed) {
			events.publishEvent(new QuizPassed(userId, chapter.courseId()));
		}
		List<QuizViews.QuestionResult> results = quiz.getQuestions().stream()
				.map(question -> new QuizViews.QuestionResult(question.getId(), correctness.get(question.getId()),
						revealed ? question.correctChoiceIds().stream().sorted().toList() : null,
						revealed ? question.getExplanationMd() : null))
				.toList();
		return new QuizViews.AttemptResult(score, passed, usedNow, max, revealed, results);
	}

	/** État des quiz d'un cours pour un membre (barre latérale du lecteur de cours). */
	List<QuizViews.ChapterStatus> statuses(long userId, long courseId) {
		List<Long> chapterIds = courses.chapters(courseId).stream().map(ChapterRef::id).toList();
		return quizzes.findByChapterIdIn(chapterIds).stream()
				.map(quiz -> {
					Short best = attempts.bestScore(quiz.getId(), userId);
					return new QuizViews.ChapterStatus(quiz.getChapterId(), quiz.getQuestions().size(),
							attempts.existsByQuizIdAndUserIdAndPassedTrue(quiz.getId(), userId),
							best == null ? null : best.intValue(), attempts.countByQuizIdAndUserId(quiz.getId(), userId),
							quiz.getMaxAttempts() == null ? null : quiz.getMaxAttempts().intValue());
				})
				.toList();
	}

	List<QuizViews.PublicQuizInfo> publicInfo(long courseId) {
		boolean published = courses.findCourse(courseId).map(CourseRef::published).orElse(false);
		if (!published) {
			return List.of();
		}
		List<Long> chapterIds = courses.chapters(courseId).stream().map(ChapterRef::id).toList();
		return quizzes.findByChapterIdIn(chapterIds).stream()
				.map(quiz -> new QuizViews.PublicQuizInfo(quiz.getChapterId(), quiz.getQuestions().size()))
				.toList();
	}

	/** Tous les quiz des chapitres donnés ont-ils été réussis par ce membre ? */
	boolean allPassed(long userId, Collection<Long> chapterIds) {
		return quizzes.findByChapterIdIn(chapterIds).stream()
				.allMatch(quiz -> attempts.existsByQuizIdAndUserIdAndPassedTrue(quiz.getId(), userId));
	}

	private ChapterRef readableChapter(long userId, long chapterId) {
		ChapterRef chapter = chapter(chapterId);
		if (courses.canManage(userId, chapter.courseId())) {
			return chapter;
		}
		boolean published = courses.findCourse(chapter.courseId()).map(CourseRef::published).orElse(false);
		if (!published) {
			throw new ApiException(HttpStatus.NOT_FOUND, "CHAPTER_NOT_FOUND", "Chapitre introuvable.");
		}
		if (!courses.isEnrolled(userId, chapter.courseId())) {
			throw ApiException.forbidden("NOT_ENROLLED", "Inscrivez-vous au cours pour accéder à ce quiz.");
		}
		return chapter;
	}

	private Quiz quizOf(long chapterId) {
		return quizzes.findByChapterId(chapterId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "QUIZ_NOT_FOUND", "Ce chapitre n'a pas de quiz."));
	}

	private static void validate(QuizDraft draft) {
		require(draft.passScorePct() >= 1 && draft.passScorePct() <= 100, "Le seuil de réussite doit être entre 1 et 100 %.");
		require(draft.maxAttempts() == null || (draft.maxAttempts() >= 1 && draft.maxAttempts() <= 20),
				"Le nombre de tentatives doit être entre 1 et 20 (ou illimité).");
		require(draft.questions() != null && !draft.questions().isEmpty() && draft.questions().size() <= 30,
				"Un quiz compte de 1 à 30 questions.");
		int number = 1;
		for (QuestionDraft question : draft.questions()) {
			String prefix = "Question " + number++ + " : ";
			require(question.kind() != null, prefix + "type manquant.");
			require(question.promptMd() != null && !question.promptMd().isBlank() && question.promptMd().length() <= 5_000,
					prefix + "énoncé manquant ou trop long.");
			require(question.points() >= 1 && question.points() <= 10, prefix + "de 1 à 10 points.");
			require(question.choices() != null && question.choices().size() >= 2 && question.choices().size() <= 8,
					prefix + "de 2 à 8 choix.");
			require(question.choices().stream().allMatch(choice -> choice.labelMd() != null && !choice.labelMd().isBlank()
					&& choice.labelMd().length() <= 1_000), prefix + "chaque choix doit avoir un texte.");
			long correct = question.choices().stream().filter(ChoiceDraft::correct).count();
			require(question.kind() == QuestionKind.SINGLE ? correct == 1 : correct >= 1,
					prefix + (question.kind() == QuestionKind.SINGLE ? "exactement une bonne réponse." : "au moins une bonne réponse."));
		}
	}

	private static void require(boolean condition, String message) {
		if (!condition) {
			throw ApiException.badRequest("INVALID_QUIZ", message);
		}
	}

	static Map<Long, Set<Long>> toAnswerMap(Collection<QuizController.Answer> answers) {
		return answers.stream().collect(Collectors.toMap(QuizController.Answer::questionId,
				answer -> answer.choiceIds() == null ? Set.of() : Set.copyOf(answer.choiceIds()), (a, b) -> a));
	}
}
