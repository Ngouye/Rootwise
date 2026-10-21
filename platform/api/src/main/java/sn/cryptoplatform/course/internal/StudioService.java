package sn.cryptoplatform.course.internal;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.cryptoplatform.course.CourseAuthoring;
import sn.cryptoplatform.course.CourseLevel;
import sn.cryptoplatform.course.LessonType;
import sn.cryptoplatform.media.MediaInfo;
import sn.cryptoplatform.media.MediaKind;
import sn.cryptoplatform.media.MediaService;
import sn.cryptoplatform.shared.tag.Tag;
import sn.cryptoplatform.shared.tag.TagRepository;
import sn.cryptoplatform.shared.web.ApiException;
import sn.cryptoplatform.user.UserAccount;
import sn.cryptoplatform.user.UserService;

@Service
@Transactional
class StudioService implements CourseAuthoring {

	private final CourseRepository courses;
	private final ChapterRepository chapters;
	private final LessonRepository lessons;
	private final EnrollmentRepository enrollments;
	private final TagRepository tags;
	private final MediaService media;
	private final CourseAccess access;
	private final UserService users;

	StudioService(CourseRepository courses, ChapterRepository chapters, LessonRepository lessons,
			EnrollmentRepository enrollments, TagRepository tags, MediaService media, CourseAccess access,
			UserService users) {
		this.courses = courses;
		this.chapters = chapters;
		this.lessons = lessons;
		this.enrollments = enrollments;
		this.tags = tags;
		this.media = media;
		this.access = access;
		this.users = users;
	}

	// ---------- Lecture ----------

	@Transactional(readOnly = true)
	List<StudioViews.CourseSummary> list(long userId, boolean admin) {
		List<Course> found = admin ? courses.findAllByOrderByUpdatedAtDesc() : courses.findByAuthorIdOrderByUpdatedAtDesc(userId);
		return found.stream()
				.map(course -> new StudioViews.CourseSummary(course.getId(), course.getSlug(), course.getTitle(),
						course.getStatus().name(), course.getLevel(), course.getUpdatedAt(), course.getChapters().size(),
						course.lessons().size()))
				.toList();
	}

	@Transactional(readOnly = true)
	StudioViews.CourseView view(long courseId) {
		Course course = course(courseId);
		List<StudioViews.ChapterView> chapterViews = course.getChapters().stream()
				.map(chapter -> new StudioViews.ChapterView(chapter.getId(), chapter.getTitle(), chapter.getLessons().stream()
						.map(lesson -> new StudioViews.LessonView(lesson.getId(), lesson.getTitle(), lesson.getType(),
								lesson.getContentMd(), lesson.getMediaId(),
								lesson.getMediaId() == null ? null : media.find(lesson.getMediaId()).map(MediaInfo::originalName).orElse(null),
								lesson.getYoutubeId(), lesson.getDurationSeconds(), lesson.isFreePreview()))
						.toList()))
				.toList();
		return new StudioViews.CourseView(course.getId(), course.getSlug(), course.getTitle(), course.getSummary(),
				course.getDescriptionMd(), course.getLevel(), course.getStatus().name(),
				course.getTags().stream().map(Tag::getSlug).sorted().toList(), course.getCoverMediaId(),
				CourseViews.coverUrl(course), users.findById(course.getAuthorId()).map(UserAccount::username).orElse(null),
				chapterViews, publishProblems(course));
	}

	@Transactional(readOnly = true)
	Course courseById(long courseId) {
		return course(courseId);
	}

	@Transactional(readOnly = true)
	Course courseOfChapter(long chapterId) {
		return (Course) Hibernate.unproxy(chapter(chapterId).getCourse());
	}

	@Transactional(readOnly = true)
	Course courseOfLesson(long lessonId) {
		return (Course) Hibernate.unproxy(lesson(lessonId).getChapter().getCourse());
	}

	// ---------- Cours ----------

	@Override
	public long createCourse(long authorId, String title, String summary, CourseLevel level) {
		String base = Slugs.from(title);
		String slug = base;
		for (int suffix = 2; courses.existsBySlug(slug); suffix++) {
			slug = base + "-" + suffix;
		}
		return courses.save(new Course(authorId, slug, title.trim(), summary.trim(), level)).getId();
	}

	@Override
	public void updateCourse(long courseId, CourseDetails details) {
		Course course = course(courseId);
		course.setTitle(details.title().trim());
		course.setSummary(details.summary().trim());
		course.setDescriptionMd(details.descriptionMd());
		course.setLevel(details.level());

		List<String> requested = details.tagSlugs() == null ? List.of() : details.tagSlugs();
		Set<Tag> found = new HashSet<>(tags.findBySlugIn(requested));
		if (found.size() != new HashSet<>(requested).size()) {
			throw ApiException.badRequest("UNKNOWN_TAG", "Un des tags choisis n'existe pas.");
		}
		course.replaceTags(found);

		if (details.coverMediaId() != null) {
			requireMedia(details.coverMediaId(), MediaKind.IMAGE, course);
		}
		course.setCoverMediaId(details.coverMediaId());

		if (details.authorId() != null && !details.authorId().equals(course.getAuthorId())) {
			if (!access.canAuthor(details.authorId())) {
				throw ApiException.badRequest("INVALID_AUTHOR", "L'auteur doit être un créateur ou un administrateur actif.");
			}
			course.changeAuthor(details.authorId());
		}
	}

	@Override
	public void publish(long courseId) {
		Course course = course(courseId);
		List<String> problems = publishProblems(course);
		if (!problems.isEmpty()) {
			throw ApiException.badRequest("NOT_PUBLISHABLE", "Publication impossible : " + String.join(" ", problems));
		}
		course.publish();
	}

	void unpublish(long courseId) {
		course(courseId).unpublish();
	}

	/** Seul un brouillon sans aucun inscrit peut être supprimé. */
	void deleteCourse(long courseId) {
		Course course = course(courseId);
		if (course.isPublished() || enrollments.existsByCourseId(courseId)) {
			throw ApiException.conflict("COURSE_IN_USE", "Dépubliez le cours ; un cours qui a des inscrits ne peut pas être supprimé.");
		}
		courses.delete(course);
	}

	// ---------- Chapitres ----------

	@Override
	public long addChapter(long courseId, String title) {
		Chapter chapter = course(courseId).addChapter(title.trim());
		chapters.save(chapter);
		return chapter.getId();
	}

	void renameChapter(long chapterId, String title) {
		chapter(chapterId).setTitle(title.trim());
	}

	void deleteChapter(long chapterId) {
		Chapter chapter = chapter(chapterId);
		chapter.getCourse().removeChapter(chapter);
	}

	void moveChapter(long chapterId, int offset) {
		Chapter chapter = chapter(chapterId);
		chapter.getCourse().move(chapter, offset);
	}

	// ---------- Leçons ----------

	@Override
	public long addLesson(long chapterId, LessonDraft draft) {
		Chapter chapter = chapter(chapterId);
		validate(draft, chapter.getCourse());
		Lesson lesson = chapter.addLesson(draft);
		lessons.save(lesson);
		return lesson.getId();
	}

	void updateLesson(long lessonId, LessonDraft draft) {
		Lesson lesson = lesson(lessonId);
		validate(draft, lesson.getChapter().getCourse());
		lesson.apply(draft);
	}

	void deleteLesson(long lessonId) {
		Lesson lesson = lesson(lessonId);
		lesson.getChapter().removeLesson(lesson);
	}

	void moveLesson(long lessonId, int offset) {
		Lesson lesson = lesson(lessonId);
		lesson.getChapter().move(lesson, offset);
	}

	// ---------- Règles ----------

	private void validate(LessonDraft draft, Course course) {
		if (draft.type() == LessonType.TEXT) {
			if (draft.contentMd() == null || draft.contentMd().isBlank()) {
				throw ApiException.badRequest("LESSON_CONTENT_REQUIRED", "Une leçon texte doit avoir un contenu.");
			}
			return;
		}
		if (draft.type() == LessonType.YOUTUBE) {
			if (draft.youtubeId() == null || !draft.youtubeId().matches("[A-Za-z0-9_-]{11}")) {
				throw ApiException.badRequest("INVALID_YOUTUBE_URL", "Lien YouTube invalide.");
			}
			return;
		}
		if (draft.mediaId() == null) {
			throw ApiException.badRequest("LESSON_MEDIA_REQUIRED", "Envoyez d'abord le fichier de la leçon.");
		}
		requireMedia(draft.mediaId(), draft.type() == LessonType.VIDEO ? MediaKind.VIDEO : MediaKind.PDF, course);
	}

	/** Le fichier doit exister, être du bon type et appartenir à l'auteur du cours (ou à un admin). */
	private void requireMedia(long mediaId, MediaKind kind, Course course) {
		MediaInfo found = media.find(mediaId)
				.filter(info -> info.kind() == kind)
				.filter(info -> info.ownerId() != null
						&& (info.ownerId() == course.getAuthorId() || access.isAdmin(info.ownerId())))
				.orElse(null);
		if (found == null) {
			throw ApiException.badRequest("INVALID_MEDIA", "Fichier introuvable ou de type incorrect.");
		}
	}

	private static List<String> publishProblems(Course course) {
		List<String> problems = new ArrayList<>();
		if (course.getChapters().isEmpty()) {
			problems.add("Ajoutez au moins un chapitre.");
		}
		course.getChapters().stream()
				.filter(chapter -> chapter.getLessons().isEmpty())
				.forEach(chapter -> problems.add("Le chapitre « " + chapter.getTitle() + " » n'a aucune leçon."));
		return problems;
	}

	private Course course(long courseId) {
		return courses.findById(courseId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "COURSE_NOT_FOUND", "Cours introuvable."));
	}

	private Chapter chapter(long chapterId) {
		return chapters.findById(chapterId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CHAPTER_NOT_FOUND", "Chapitre introuvable."));
	}

	private Lesson lesson(long lessonId) {
		return lessons.findById(lessonId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "LESSON_NOT_FOUND", "Leçon introuvable."));
	}
}
