package sn.cryptoplatform.course.internal;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import sn.cryptoplatform.course.CourseLevel;
import sn.cryptoplatform.course.LessonType;
import sn.cryptoplatform.shared.tag.Tag;
import sn.cryptoplatform.user.PublicProfile;

/** Réponses JSON du module cours (jamais les entités elles-mêmes). */
final class CourseViews {

	private CourseViews() {
	}

	record TagView(String slug, String name) {

		static List<TagView> of(Iterable<Tag> tags) {
			List<TagView> views = new java.util.ArrayList<>();
			tags.forEach(tag -> views.add(new TagView(tag.getSlug(), tag.getName())));
			views.sort(Comparator.comparing(TagView::name));
			return views;
		}
	}

	/** Auteur d'un cours tel qu'il s'affiche aux visiteurs (formateur). */
	record AuthorView(String username, String displayName, String headline, String bio, String avatarUrl) {

		static final AuthorView UNKNOWN = new AuthorView(null, "—", null, null, null);

		static AuthorView of(PublicProfile profile) {
			return profile == null ? UNKNOWN
					: new AuthorView(profile.username(), profile.displayName(), profile.headline(), profile.bio(), profile.avatarUrl());
		}
	}

	record CourseSummary(long id, String slug, String title, String summary, CourseLevel level, List<TagView> tags,
			String authorName, AuthorView author, String coverUrl, int chapterCount, int lessonCount, int durationMinutes) {

		static CourseSummary of(Course course, Map<Long, PublicProfile> authors, CourseStats stats) {
			AuthorView author = AuthorView.of(authors.get(course.getAuthorId()));
			return new CourseSummary(course.getId(), course.getSlug(), course.getTitle(), course.getSummary(),
					course.getLevel(), TagView.of(course.getTags()), author.displayName(), author,
					CourseViews.coverUrl(course), stats.chapterCount().intValue(), stats.lessonCount().intValue(),
					stats.durationMinutes());
		}
	}

	record LessonSummary(long id, String title, LessonType type, Integer durationSeconds, boolean freePreview) {

		static LessonSummary of(Lesson lesson) {
			return new LessonSummary(lesson.getId(), lesson.getTitle(), lesson.getType(), lesson.getDurationSeconds(),
					lesson.isFreePreview());
		}
	}

	record ChapterView(long id, String title, List<LessonSummary> lessons) {

		static ChapterView of(Chapter chapter) {
			return new ChapterView(chapter.getId(), chapter.getTitle(),
					chapter.getLessons().stream().map(LessonSummary::of).toList());
		}
	}

	record CourseDetail(CourseSummary course, String descriptionMd, Instant publishedAt, List<ChapterView> chapters) {

		static CourseDetail of(Course course, Map<Long, PublicProfile> authors) {
			return new CourseDetail(CourseSummary.of(course, authors, CourseStats.of(course)), course.getDescriptionMd(),
					course.getPublishedAt(), course.getChapters().stream().map(ChapterView::of).toList());
		}
	}

	record ProgressView(boolean enrolled, int progressPct, Long lastLessonId, List<Long> completedLessonIds,
			Instant completedAt) {

		static final ProgressView NOT_ENROLLED = new ProgressView(false, 0, null, List.of(), null);
	}

	record LessonView(long id, String title, LessonType type, String contentMd, String mediaUrl, String youtubeId,
			Integer durationSeconds, boolean freePreview, long chapterId, String chapterTitle, long courseId,
			String courseSlug, String courseTitle, boolean enrolled, int positionSeconds, boolean completed,
			Long previousLessonId, Long nextLessonId) {
	}

	record MyCourse(CourseSummary course, int progressPct, Long lastLessonId, Instant enrolledAt, Instant completedAt) {
	}

	static String coverUrl(Course course) {
		return course.getCoverMediaId() == null ? null : "/api/public/media/" + course.getCoverMediaId();
	}
}
