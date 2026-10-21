package sn.cryptoplatform.quiz.internal;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface QuizRepository extends JpaRepository<Quiz, Long> {

	Optional<Quiz> findByChapterId(long chapterId);

	List<Quiz> findByChapterIdIn(Collection<Long> chapterIds);
}

interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

	int countByQuizIdAndUserId(long quizId, long userId);

	boolean existsByQuizIdAndUserIdAndPassedTrue(long quizId, long userId);

	@Query("select max(a.scorePct) from QuizAttempt a where a.quizId = :quizId and a.userId = :userId")
	Short bestScore(long quizId, long userId);
}

interface CertificateRepository extends JpaRepository<Certificate, Long> {

	boolean existsByUserIdAndCourseId(long userId, long courseId);

	Optional<Certificate> findBySerial(UUID serial);

	Optional<Certificate> findByUserIdAndCourseId(long userId, long courseId);

	List<Certificate> findByUserIdOrderByIssuedAtDesc(long userId);
}

interface SigningKeyRepository extends JpaRepository<SigningKeyRecord, String> {
}
