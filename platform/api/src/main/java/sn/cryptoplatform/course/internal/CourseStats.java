package sn.cryptoplatform.course.internal;

import java.util.List;

/** Volume d'un cours : chapitres, leçons et durée totale (secondes). */
record CourseStats(Long courseId, Long chapterCount, Long lessonCount, Long durationSeconds) {

	/** Cours sans chapitre : absent du résultat de {@link CourseRepository#statsFor}. */
	static CourseStats empty(long courseId) {
		return new CourseStats(courseId, 0L, 0L, 0L);
	}

	/** Calcul en mémoire, pour un cours dont les chapitres et les leçons sont déjà chargés. */
	static CourseStats of(Course course) {
		List<Lesson> lessons = course.lessons();
		long seconds = lessons.stream().mapToLong(lesson -> lesson.getDurationSeconds() == null ? 0 : lesson.getDurationSeconds()).sum();
		return new CourseStats(course.getId(), (long) course.getChapters().size(), (long) lessons.size(), seconds);
	}

	int durationMinutes() {
		return (int) ((durationSeconds + 59) / 60);
	}
}
