package sn.cryptoplatform.course.internal;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import sn.cryptoplatform.media.MediaService;
import sn.cryptoplatform.shared.security.CurrentUser;

@RestController
class LearningController {

	record ProgressRequest(
			@Min(value = 0, message = "Position invalide.") @Max(value = 86_400, message = "Position invalide.") int positionSeconds,
			boolean completed) {
	}

	private final LearningService learning;
	private final MediaService media;

	LearningController(LearningService learning, MediaService media) {
		this.learning = learning;
		this.media = media;
	}

	@PostMapping("/api/courses/{slug}/enrollment")
	CourseViews.ProgressView enroll(@PathVariable String slug) {
		return learning.enroll(CurrentUser.id(), slug);
	}

	@GetMapping("/api/courses/{slug}/progress")
	CourseViews.ProgressView progress(@PathVariable String slug) {
		return learning.progress(CurrentUser.id(), slug);
	}

	@GetMapping("/api/lessons/{id}")
	CourseViews.LessonView lesson(@PathVariable long id) {
		return learning.lesson(CurrentUser.id(), id);
	}

	/** Vidéo ou PDF de la leçon, relayé depuis le stockage après vérification des droits (Range pris en charge). */
	@GetMapping("/api/lessons/{id}/media")
	ResponseEntity<StreamingResponseBody> lessonMedia(@PathVariable long id,
			@RequestHeader(value = HttpHeaders.RANGE, required = false) String range) {
		return media.stream(learning.lessonMedia(CurrentUser.id(), id), range);
	}

	@PutMapping("/api/lessons/{id}/progress")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void recordProgress(@PathVariable long id, @Valid @RequestBody ProgressRequest body) {
		learning.recordProgress(CurrentUser.id(), id, body.positionSeconds(), body.completed());
	}

	@GetMapping("/api/me/courses")
	List<CourseViews.MyCourse> myCourses() {
		return learning.myCourses(CurrentUser.id());
	}
}
