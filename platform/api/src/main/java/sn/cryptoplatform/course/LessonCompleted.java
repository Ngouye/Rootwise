package sn.cryptoplatform.course;

/** Un membre inscrit a terminé une leçon pour la première fois. */
public record LessonCompleted(long userId, long courseId, long lessonId) {
}
