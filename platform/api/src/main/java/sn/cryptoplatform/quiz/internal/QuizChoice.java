package sn.cryptoplatform.quiz.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import sn.cryptoplatform.quiz.QuizAuthoring;

@Entity
@Table(name = "quiz_choices")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class QuizChoice {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "question_id")
	private QuizQuestion question;

	private int position;

	private String labelMd;

	/** Jamais envoyé au membre avant correction. */
	@Column(name = "is_correct")
	private boolean correct;

	QuizChoice(QuizQuestion question, int position, QuizAuthoring.ChoiceDraft draft) {
		this.question = question;
		this.position = position;
		this.labelMd = draft.labelMd();
		this.correct = draft.correct();
	}
}
