package sn.cryptoplatform.quiz.internal;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import sn.cryptoplatform.quiz.QuizAuthoring;

/** Quiz de fin de chapitre (un par chapitre). */
@Entity
@Table(name = "quizzes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class Quiz {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private Long chapterId;

	@Column(name = "pass_score_pct")
	private short passScorePct;

	private Short maxAttempts;

	private Integer timeLimitSec;

	@OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("position")
	private List<QuizQuestion> questions = new ArrayList<>();

	Quiz(long chapterId) {
		this.chapterId = chapterId;
	}

	/** Remplace réglages et questions, en gardant la même ligne (et donc l'historique des tentatives). */
	void replace(QuizAuthoring.QuizDraft draft) {
		passScorePct = (short) draft.passScorePct();
		maxAttempts = draft.maxAttempts() == null ? null : draft.maxAttempts().shortValue();
		questions.clear();
		for (QuizAuthoring.QuestionDraft question : draft.questions()) {
			questions.add(new QuizQuestion(this, questions.size() + 1, question));
		}
	}

	int totalPoints() {
		return questions.stream().mapToInt(QuizQuestion::getPoints).sum();
	}
}
