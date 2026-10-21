package sn.cryptoplatform.course.internal;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.cryptoplatform.course.CourseDirectory;

@Service
@Transactional(readOnly = true)
class DefaultCourseDirectory implements CourseDirectory {

	private final CourseRepository courses;
	private final ChapterRepository chapters;
	private final EnrollmentRepository enrollments;
	private final LessonProgressRepository progress;
	private final CourseAccess access;

	DefaultCourseDirectory(CourseRepository courses, ChapterRepository chapters, EnrollmentRepository enrollments,
			LessonProgressRepository progress, CourseAccess access) {
		this.courses = courses;
		this.chapters = chapters;
		this.enrollments = enrollments;
		this.progress = progress;
		this.access = access;
	}

	@Override
	public Optional<CourseRef> findCourse(long courseId) {
		return courses.findById(courseId).map(DefaultCourseDirectory::ref);
	}

	@Override
	public Optional<ChapterRef> findChapter(long chapterId) {
		return chapters.findById(chapterId).map(DefaultCourseDirectory::ref);
	}

	@Override
	public List<ChapterRef> chapters(long courseId) {
		return courses.findById(courseId)
				.map(course -> course.getChapters().stream().map(DefaultCourseDirectory::ref).toList())
				.orElse(List.of());
	}

	@Override
	public boolean isEnrolled(long userId, long courseId) {
		return enrollments.existsById(new Enrollment.Key(userId, courseId));
	}

	@Override
	public boolean hasCompletedAllLessons(long userId, long courseId) {
		return courses.findById(courseId).map(course -> {
			List<Long> lessonIds = course.lessons().stream().map(Lesson::getId).toList();
			long completed = progress.findForLessons(userId, lessonIds).stream().filter(LessonProgress::isCompleted).count();
			return !lessonIds.isEmpty() && completed == lessonIds.size();
		}).orElse(false);
	}

	@Override
	public boolean canManage(long userId, long courseId) {
		return courses.findById(courseId).map(course -> access.canManage(userId, course)).orElse(false);
	}

	private static CourseRef ref(Course course) {
		return new CourseRef(course.getId(), course.getSlug(), course.getTitle(), course.getAuthorId(), course.isPublished());
	}

	private static ChapterRef ref(Chapter chapter) {
		return new ChapterRef(chapter.getId(), chapter.getCourse().getId(), chapter.getTitle());
	}
}
