package sn.cryptoplatform.course.internal;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {

	Optional<Course> findBySlug(String slug);

	boolean existsBySlug(String slug);

	List<Course> findByAuthorIdOrderByUpdatedAtDesc(long authorId);

	List<Course> findAllByOrderByUpdatedAtDesc();

	/**
	 * Chapitres, leçons et durée de plusieurs cours, calculés par la base : le catalogue n'a pas à
	 * charger les leçons (et leur texte Markdown) pour les compter.
	 */
	@Query("""
			select new sn.cryptoplatform.course.internal.CourseStats(ch.course.id, count(distinct ch.id), count(l.id),
			       coalesce(sum(l.durationSeconds), 0L))
			from Chapter ch left join ch.lessons l
			where ch.course.id in :courseIds
			group by ch.course.id""")
	List<CourseStats> statsFor(Collection<Long> courseIds);
}

interface ChapterRepository extends JpaRepository<Chapter, Long> {
}

interface LessonRepository extends JpaRepository<Lesson, Long> {
}

interface EnrollmentRepository extends JpaRepository<Enrollment, Enrollment.Key> {

	List<Enrollment> findByUserIdOrderByEnrolledAtDesc(long userId);

	boolean existsByCourseId(long courseId);
}

interface LessonProgressRepository extends JpaRepository<LessonProgress, LessonProgress.Key> {

	@Query("select p from LessonProgress p where p.userId = :userId and p.lessonId in :lessonIds")
	List<LessonProgress> findForLessons(long userId, Collection<Long> lessonIds);
}
