package sn.cryptoplatform.course.internal;

import java.time.Instant;
import java.util.List;

import sn.cryptoplatform.course.CourseLevel;
import sn.cryptoplatform.course.LessonType;

/** Réponses du studio : contenu complet, y compris les brouillons. */
final class StudioViews {

	private StudioViews() {
	}

	record CourseSummary(long id, String slug, String title, String status, CourseLevel level, Instant updatedAt,
			int chapterCount, int lessonCount) {
	}

	record LessonView(long id, String title, LessonType type, String contentMd, Long mediaId, String mediaName,
			String youtubeId, Integer durationSeconds, boolean freePreview) {
	}

	record ChapterView(long id, String title, List<LessonView> lessons) {
	}

	/** {@code publishProblems} liste ce qui empêche la publication (vide = publiable). */
	record CourseView(long id, String slug, String title, String summary, String descriptionMd, CourseLevel level,
			String status, List<String> tagSlugs, Long coverMediaId, String coverUrl, String authorUsername,
			List<ChapterView> chapters, List<String> publishProblems) {
	}
}
