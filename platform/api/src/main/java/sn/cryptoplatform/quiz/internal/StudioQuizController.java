package sn.cryptoplatform.quiz.internal;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import sn.cryptoplatform.course.CourseDirectory;
import sn.cryptoplatform.quiz.QuizAuthoring;
import sn.cryptoplatform.shared.security.CurrentUser;
import sn.cryptoplatform.shared.web.ApiException;

/** Édition du quiz de fin de chapitre depuis le studio (auteur du cours ou administrateur). */
@RestController
@RequestMapping("/api/studio/chapters/{chapterId}/quiz")
@PreAuthorize("hasAnyRole('CREATOR', 'ADMIN')")
class StudioQuizController {

	record ChoiceRequest(String labelMd, boolean correct) {
	}

	record QuestionRequest(@NotNull QuizAuthoring.QuestionKind kind, String promptMd, String explanationMd, int points,
			@Size(max = 8) List<ChoiceRequest> choices) {
	}

	record QuizRequest(int passScorePct, Integer maxAttempts, @NotNull @Size(max = 30) List<@Valid QuestionRequest> questions) {

		QuizAuthoring.QuizDraft draft() {
			return new QuizAuthoring.QuizDraft(passScorePct, maxAttempts, questions.stream()
					.map(question -> new QuizAuthoring.QuestionDraft(question.kind(), question.promptMd(),
							question.explanationMd(), question.points(), question.choices() == null ? List.of()
									: question.choices().stream()
											.map(choice -> new QuizAuthoring.ChoiceDraft(choice.labelMd(), choice.correct()))
											.toList()))
					.toList());
		}
	}

	private final QuizService quizzes;
	private final CourseDirectory courses;

	StudioQuizController(QuizService quizzes, CourseDirectory courses) {
		this.quizzes = quizzes;
		this.courses = courses;
	}

	@GetMapping
	QuizViews.StudioQuiz get(@PathVariable long chapterId) {
		guard(chapterId);
		return quizzes.studioView(chapterId);
	}

	@PutMapping
	QuizViews.StudioQuiz save(@PathVariable long chapterId, @Valid @RequestBody QuizRequest body) {
		guard(chapterId);
		quizzes.saveQuiz(chapterId, body.draft());
		return quizzes.studioView(chapterId);
	}

	@DeleteMapping
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void delete(@PathVariable long chapterId) {
		guard(chapterId);
		quizzes.deleteQuiz(chapterId);
	}

	private void guard(long chapterId) {
		long courseId = quizzes.chapter(chapterId).courseId();
		if (!courses.canManage(CurrentUser.id(), courseId)) {
			throw ApiException.forbidden("NOT_COURSE_OWNER", "Vous ne pouvez modifier que vos propres cours.");
		}
	}
}
