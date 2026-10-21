package sn.cryptoplatform.course.internal;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.cryptoplatform.course.CourseLessonsCompleted;
import sn.cryptoplatform.course.LessonCompleted;
import sn.cryptoplatform.course.LessonType;
import sn.cryptoplatform.media.MediaInfo;
import sn.cryptoplatform.media.MediaService;
import sn.cryptoplatform.shared.web.ApiException;
import sn.cryptoplatform.user.PublicProfile;
import sn.cryptoplatform.user.UserService;

/** Inscription, lecture des leçons et suivi de progression d'un membre. */
@Service
@Transactional(readOnly = true)
class LearningService {

	private final CourseRepository courses;
	private final LessonRepository lessons;
	private final EnrollmentRepository enrollments;
	private final LessonProgressRepository progress;
	private final CourseAccess access;
	private final MediaService media;
	private final UserService users;
	private final ApplicationEventPublisher events;

	LearningService(CourseRepository courses, LessonRepository lessons, EnrollmentRepository enrollments,
			LessonProgressRepository progress, CourseAccess access, MediaService media, UserService users,
			ApplicationEventPublisher events) {
		this.courses = courses;
		this.lessons = lessons;
		this.enrollments = enrollments;
		this.progress = progress;
		this.access = access;
		this.media = media;
		this.users = users;
		this.events = events;
	}

	@Transactional
	CourseViews.ProgressView enroll(long userId, String slug) {
		Course course = publishedCourse(slug);
		if (!enrollments.existsById(new Enrollment.Key(userId, course.getId()))) {
			enrollments.save(new Enrollment(userId, course.getId()));
		}
		return progressOf(userId, course);
	}

	CourseViews.ProgressView progress(long userId, String slug) {
		return progressOf(userId, publishedCourse(slug));
	}

	@Transactional
	CourseViews.LessonView lesson(long userId, long lessonId) {
		Lesson lesson = readableLesson(userId, lessonId);
		Course course = lesson.getChapter().getCourse();
		var enrollment = enrollments.findById(new Enrollment.Key(userId, course.getId()));
		enrollment.ifPresent(found -> found.recordVisit(lessonId));
		LessonProgress state = progress.findById(new LessonProgress.Key(userId, lessonId)).orElse(null);

		List<Lesson> ordered = course.lessons();
		int index = ordered.indexOf(lesson);
		return new CourseViews.LessonView(lesson.getId(), lesson.getTitle(), lesson.getType(), lesson.getContentMd(),
				lesson.getMediaId() == null ? null : "/api/lessons/" + lesson.getId() + "/media", lesson.getYoutubeId(),
				lesson.getDurationSeconds(), lesson.isFreePreview(), lesson.getChapter().getId(),
				lesson.getChapter().getTitle(), course.getId(), course.getSlug(), course.getTitle(), enrollment.isPresent(),
				state == null ? 0 : state.getPositionSeconds(), state != null && state.isCompleted(),
				index > 0 ? ordered.get(index - 1).getId() : null,
				index < ordered.size() - 1 ? ordered.get(index + 1).getId() : null);
	}

	MediaInfo lessonMedia(long userId, long lessonId) {
		Lesson lesson = readableLesson(userId, lessonId);
		if (lesson.getMediaId() == null) {
			throw new ApiException(HttpStatus.NOT_FOUND, "MEDIA_NOT_FOUND", "Cette leçon n'a pas de fichier.");
		}
		return media.find(lesson.getMediaId())
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MEDIA_NOT_FOUND", "Fichier introuvable."));
	}

	/**
	 * Position de lecture et achèvement. Terminer une leçon met à jour le pourcentage du cours et
	 * publie les événements utilisés par le module quiz pour délivrer le certificat.
	 */
	@Transactional
	void recordProgress(long userId, long lessonId, int positionSeconds, boolean completed) {
		Lesson lesson = readableLesson(userId, lessonId);
		Course course = lesson.getChapter().getCourse();
		Enrollment enrollment = enrollments.findById(new Enrollment.Key(userId, course.getId())).orElse(null);
		if (enrollment == null) {
			return; // aperçu gratuit consulté sans inscription : rien à suivre
		}
		enrollment.recordVisit(lessonId);

		LessonProgress state = progress.findById(new LessonProgress.Key(userId, lessonId))
				.orElseGet(() -> progress.save(new LessonProgress(userId, lessonId)));
		if (!state.record(positionSeconds, completed)) {
			return;
		}
		events.publishEvent(new LessonCompleted(userId, course.getId(), lessonId));

		List<Long> lessonIds = course.lessons().stream().map(Lesson::getId).toList();
		long done = progress.findForLessons(userId, lessonIds).stream().filter(LessonProgress::isCompleted).count();
		if (enrollment.updateProgress((int) done, lessonIds.size())) {
			events.publishEvent(new CourseLessonsCompleted(userId, course.getId()));
		}
	}

	List<CourseViews.MyCourse> myCourses(long userId) {
		List<Enrollment> mine = enrollments.findByUserIdOrderByEnrolledAtDesc(userId);
		Map<Long, Course> byId = courses.findAllById(mine.stream().map(Enrollment::getCourseId).toList()).stream()
				.collect(Collectors.toMap(Course::getId, Function.identity()));
		Map<Long, PublicProfile> authors = users.findPublicProfiles(byId.values().stream().map(Course::getAuthorId).toList());
		return mine.stream()
				.filter(enrollment -> byId.containsKey(enrollment.getCourseId()))
				.map(enrollment -> {
					Course course = byId.get(enrollment.getCourseId());
					return new CourseViews.MyCourse(CourseViews.CourseSummary.of(course, authors, CourseStats.of(course)),
							progressOf(userId, course).progressPct(), enrollment.getLastLessonId(),
							enrollment.getEnrolledAt(), enrollment.getCompletedAt());
				})
				.toList();
	}

	/** Pourcentage recalculé sur les leçons actuelles du cours (qui peuvent évoluer après l'inscription). */
	private CourseViews.ProgressView progressOf(long userId, Course course) {
		var enrollment = enrollments.findById(new Enrollment.Key(userId, course.getId()));
		if (enrollment.isEmpty()) {
			return CourseViews.ProgressView.NOT_ENROLLED;
		}
		List<Long> lessonIds = course.lessons().stream().map(Lesson::getId).toList();
		Set<Long> completedIds = progress.findForLessons(userId, lessonIds).stream()
				.filter(LessonProgress::isCompleted)
				.map(LessonProgress::getLessonId)
				.collect(Collectors.toSet());
		List<Long> completed = lessonIds.stream().filter(completedIds::contains).toList();
		int pct = lessonIds.isEmpty() ? 0 : Math.round(100f * completed.size() / lessonIds.size());
		return new CourseViews.ProgressView(true, pct, enrollment.get().getLastLessonId(), completed,
				enrollment.get().getCompletedAt());
	}

	private Course publishedCourse(String slug) {
		return courses.findBySlug(slug)
				.filter(Course::isPublished)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "COURSE_NOT_FOUND", "Cours introuvable."));
	}

	/** Leçon d'un cours publié, pour un membre inscrit ou en aperçu gratuit ; l'auteur et les admins voient tout. */
	private Lesson readableLesson(long userId, long lessonId) {
		Lesson lesson = lessons.findById(lessonId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "LESSON_NOT_FOUND", "Leçon introuvable."));
		Course course = lesson.getChapter().getCourse();
		if (access.canManage(userId, course)) {
			return lesson;
		}
		if (!course.isPublished()) {
			throw new ApiException(HttpStatus.NOT_FOUND, "LESSON_NOT_FOUND", "Leçon introuvable.");
		}
		if (!lesson.isFreePreview() && !enrollments.existsById(new Enrollment.Key(userId, course.getId()))) {
			throw ApiException.forbidden("NOT_ENROLLED", "Inscrivez-vous au cours pour accéder à cette leçon.");
		}
		return lesson;
	}
}
