package sn.cryptoplatform.course;

import java.util.List;

/**
 * Création et modification du contenu des cours. Les appelants (studio, jeu de démonstration)
 * ont déjà vérifié que l'utilisateur a le droit de modifier le cours.
 */
public interface CourseAuthoring {

	/** {@code authorId} : nouvel auteur (réservé aux administrateurs), ou null pour ne pas le changer. */
	record CourseDetails(String title, String summary, String descriptionMd, CourseLevel level, List<String> tagSlugs,
			Long coverMediaId, Long authorId) {

		public CourseDetails(String title, String summary, String descriptionMd, CourseLevel level, List<String> tagSlugs,
				Long coverMediaId) {
			this(title, summary, descriptionMd, level, tagSlugs, coverMediaId, null);
		}
	}

	/**
	 * {@code contentMd} : texte d'une leçon TEXT, ou notes facultatives sous une vidéo / un PDF.
	 * {@code youtubeId} : identifiant à 11 caractères d'une vidéo YouTube (type YOUTUBE).
	 */
	record LessonDraft(String title, LessonType type, String contentMd, Long mediaId, String youtubeId,
			Integer durationSeconds, boolean freePreview) {

		public LessonDraft(String title, LessonType type, String contentMd, Long mediaId, Integer durationSeconds,
				boolean freePreview) {
			this(title, type, contentMd, mediaId, null, durationSeconds, freePreview);
		}
	}

	long createCourse(long authorId, String title, String summary, CourseLevel level);

	void updateCourse(long courseId, CourseDetails details);

	long addChapter(long courseId, String title);

	long addLesson(long chapterId, LessonDraft draft);

	void publish(long courseId);
}
