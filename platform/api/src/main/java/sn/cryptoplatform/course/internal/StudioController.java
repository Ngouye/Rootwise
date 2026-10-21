package sn.cryptoplatform.course.internal;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import sn.cryptoplatform.course.CourseAuthoring;
import sn.cryptoplatform.course.CourseLevel;
import sn.cryptoplatform.course.LessonType;
import sn.cryptoplatform.shared.security.CurrentUser;
import sn.cryptoplatform.shared.web.ApiException;
import sn.cryptoplatform.user.UserService;

/**
 * Studio des professeurs/créateurs. Chaque modification renvoie le cours complet mis à jour,
 * pour que l'écran d'édition reste simple.
 */
@RestController
@RequestMapping("/api/studio")
@PreAuthorize("hasAnyRole('CREATOR', 'ADMIN')")
class StudioController {

	private static final String REQUIRED = "Champ obligatoire.";

	record NewCourseRequest(
			@NotBlank(message = REQUIRED) @Size(max = 150, message = "150 caractères au maximum.") String title,
			@NotBlank(message = REQUIRED) @Size(max = 300, message = "300 caractères au maximum.") String summary,
			@NotNull(message = REQUIRED) CourseLevel level) {
	}

	record CourseRequest(
			@NotBlank(message = REQUIRED) @Size(max = 150, message = "150 caractères au maximum.") String title,
			@NotBlank(message = REQUIRED) @Size(max = 300, message = "300 caractères au maximum.") String summary,
			@Size(max = 20_000, message = "Description trop longue.") String descriptionMd,
			@NotNull(message = REQUIRED) CourseLevel level,
			@Size(max = 8, message = "8 tags au maximum.") List<String> tagSlugs,
			Long coverMediaId,
			// Réservé aux administrateurs : réattribue le cours à un autre créateur.
			@Size(max = 40, message = "40 caractères au maximum.") String authorUsername) {
	}

	record TitleRequest(@NotBlank(message = REQUIRED) @Size(max = 150, message = "150 caractères au maximum.") String title) {
	}

	record MoveRequest(@Pattern(regexp = "UP|DOWN", message = "UP ou DOWN.") String direction) {

		int offset() {
			return "UP".equals(direction) ? -1 : 1;
		}
	}

	record LessonRequest(
			@NotBlank(message = REQUIRED) @Size(max = 200, message = "200 caractères au maximum.") String title,
			@NotNull(message = REQUIRED) LessonType type,
			@Size(max = 100_000, message = "Contenu trop long.") String contentMd,
			Long mediaId,
			@Size(max = 300, message = "Lien trop long.") String youtubeUrl,
			@Min(value = 0, message = "Durée invalide.") @Max(value = 36_000, message = "Durée invalide.") Integer durationSeconds,
			boolean freePreview) {

		CourseAuthoring.LessonDraft draft() {
			String youtubeId = null;
			if (type == LessonType.YOUTUBE) {
				youtubeId = YouTube.videoId(youtubeUrl).orElseThrow(() -> ApiException.badRequest("INVALID_YOUTUBE_URL",
						"Lien YouTube invalide : collez l'adresse d'une vidéo (youtube.com/watch?v=… ou youtu.be/…)."));
			}
			return new CourseAuthoring.LessonDraft(title, type, contentMd, mediaId, youtubeId, durationSeconds, freePreview);
		}
	}

	record Created(long id) {
	}

	private final StudioService studio;
	private final UserService users;

	StudioController(StudioService studio, UserService users) {
		this.studio = studio;
		this.users = users;
	}

	@GetMapping("/courses")
	List<StudioViews.CourseSummary> list() {
		return studio.list(CurrentUser.id(), isAdmin());
	}

	@PostMapping("/courses")
	Created create(@Valid @RequestBody NewCourseRequest body) {
		return new Created(studio.createCourse(CurrentUser.id(), body.title(), body.summary(), body.level()));
	}

	@GetMapping("/courses/{id}")
	StudioViews.CourseView get(@PathVariable long id) {
		guard(id);
		return studio.view(id);
	}

	@PutMapping("/courses/{id}")
	StudioViews.CourseView update(@PathVariable long id, @Valid @RequestBody CourseRequest body) {
		guard(id);
		Long authorId = null;
		if (body.authorUsername() != null && !body.authorUsername().isBlank()) {
			if (!isAdmin()) {
				throw ApiException.forbidden("ADMIN_ONLY", "Seul un administrateur peut changer l'auteur d'un cours.");
			}
			authorId = users.findByUsername(body.authorUsername())
					.orElseThrow(() -> ApiException.badRequest("INVALID_AUTHOR", "Aucun membre avec ce nom d'utilisateur."))
					.id();
		}
		studio.updateCourse(id, new CourseAuthoring.CourseDetails(body.title(), body.summary(), body.descriptionMd(),
				body.level(), body.tagSlugs(), body.coverMediaId(), authorId));
		return studio.view(id);
	}

	@PostMapping("/courses/{id}/publish")
	StudioViews.CourseView publish(@PathVariable long id) {
		guard(id);
		studio.publish(id);
		return studio.view(id);
	}

	@PostMapping("/courses/{id}/unpublish")
	StudioViews.CourseView unpublish(@PathVariable long id) {
		guard(id);
		studio.unpublish(id);
		return studio.view(id);
	}

	@DeleteMapping("/courses/{id}")
	void delete(@PathVariable long id) {
		guard(id);
		studio.deleteCourse(id);
	}

	@PostMapping("/courses/{id}/chapters")
	StudioViews.CourseView addChapter(@PathVariable long id, @Valid @RequestBody TitleRequest body) {
		guard(id);
		studio.addChapter(id, body.title());
		return studio.view(id);
	}

	@PutMapping("/chapters/{id}")
	StudioViews.CourseView renameChapter(@PathVariable long id, @Valid @RequestBody TitleRequest body) {
		long courseId = guard(studio.courseOfChapter(id));
		studio.renameChapter(id, body.title());
		return studio.view(courseId);
	}

	@DeleteMapping("/chapters/{id}")
	StudioViews.CourseView deleteChapter(@PathVariable long id) {
		long courseId = guard(studio.courseOfChapter(id));
		studio.deleteChapter(id);
		return studio.view(courseId);
	}

	@PostMapping("/chapters/{id}/move")
	StudioViews.CourseView moveChapter(@PathVariable long id, @Valid @RequestBody MoveRequest body) {
		long courseId = guard(studio.courseOfChapter(id));
		studio.moveChapter(id, body.offset());
		return studio.view(courseId);
	}

	@PostMapping("/chapters/{id}/lessons")
	StudioViews.CourseView addLesson(@PathVariable long id, @Valid @RequestBody LessonRequest body) {
		long courseId = guard(studio.courseOfChapter(id));
		studio.addLesson(id, body.draft());
		return studio.view(courseId);
	}

	@PutMapping("/lessons/{id}")
	StudioViews.CourseView updateLesson(@PathVariable long id, @Valid @RequestBody LessonRequest body) {
		long courseId = guard(studio.courseOfLesson(id));
		studio.updateLesson(id, body.draft());
		return studio.view(courseId);
	}

	@DeleteMapping("/lessons/{id}")
	StudioViews.CourseView deleteLesson(@PathVariable long id) {
		long courseId = guard(studio.courseOfLesson(id));
		studio.deleteLesson(id);
		return studio.view(courseId);
	}

	@PostMapping("/lessons/{id}/move")
	StudioViews.CourseView moveLesson(@PathVariable long id, @Valid @RequestBody MoveRequest body) {
		long courseId = guard(studio.courseOfLesson(id));
		studio.moveLesson(id, body.offset());
		return studio.view(courseId);
	}

	/** Un créateur ne modifie que ses propres cours ; un administrateur peut tout modifier. */
	private long guard(Course course) {
		if (!isAdmin() && course.getAuthorId() != CurrentUser.id()) {
			throw ApiException.forbidden("NOT_COURSE_OWNER", "Vous ne pouvez modifier que vos propres cours.");
		}
		return course.getId();
	}

	private void guard(long courseId) {
		guard(studio.courseById(courseId));
	}

	private static boolean isAdmin() {
		return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
				.anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
	}
}
