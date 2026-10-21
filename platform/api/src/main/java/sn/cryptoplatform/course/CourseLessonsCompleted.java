package sn.cryptoplatform.course;

/** Un membre a terminé toutes les leçons d'un cours (les quiz peuvent rester à réussir). */
public record CourseLessonsCompleted(long userId, long courseId) {
}
