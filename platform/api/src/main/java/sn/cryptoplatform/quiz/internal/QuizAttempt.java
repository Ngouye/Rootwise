package sn.cryptoplatform.quiz.internal;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "quiz_attempts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class QuizAttempt {

	/** Un choix coché par le membre pour une question. */
	@Embeddable
	@Getter
	@NoArgsConstructor(access = AccessLevel.PROTECTED)
	@AllArgsConstructor
	@EqualsAndHashCode
	static class Answer {
		private Long questionId;
		private Long choiceId;
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private Long quizId;

	private Long userId;

	private Instant startedAt;

	private Instant submittedAt;

	private Short scorePct;

	private Boolean passed;

	@ElementCollection
	@CollectionTable(name = "quiz_attempt_answers", joinColumns = @JoinColumn(name = "attempt_id"))
	private Set<Answer> answers = new HashSet<>();

	QuizAttempt(long quizId, long userId, Set<Answer> answers, int scorePct, boolean passed) {
		this.quizId = quizId;
		this.userId = userId;
		this.answers.addAll(answers);
		this.scorePct = (short) scorePct;
		this.passed = passed;
		this.startedAt = this.submittedAt = Instant.now();
	}
}
