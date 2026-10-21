package sn.cryptoplatform.course;

import java.util.List;
import java.util.Optional;

/** Lecture des cours et de la progression pour les autres modules (quiz, certificats). */
public interface CourseDirectory {

	record CourseRef(long id, String slug, String title, long authorId, boolean published) {
	}

	record ChapterRef(long id, long courseId, String title) {
	}

	Optional<CourseRef> findCourse(long courseId);

	Optional<ChapterRef> findChapter(long chapterId);

	/** Chapitres du cours, dans l'ordre. */
	List<ChapterRef> chapters(long courseId);

	boolean isEnrolled(long userId, long courseId);

	boolean hasCompletedAllLessons(long userId, long courseId);

	/** Auteur du cours ou administrateur. */
	boolean canManage(long userId, long courseId);
}
