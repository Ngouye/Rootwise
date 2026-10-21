package sn.cryptoplatform.quiz.internal;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import sn.cryptoplatform.quiz.QuizAuthoring;

@Entity
@Table(name = "quiz_questions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class QuizQuestion {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "quiz_id")
	private Quiz quiz;

	private int position;

	@Enumerated(EnumType.STRING)
	private QuizAuthoring.QuestionKind kind;

	private String promptMd;

	private String explanationMd;

	private short points;

	@OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("position")
	private List<QuizChoice> choices = new ArrayList<>();

	QuizQuestion(Quiz quiz, int position, QuizAuthoring.QuestionDraft draft) {
		this.quiz = quiz;
		this.position = position;
		this.kind = draft.kind();
		this.promptMd = draft.promptMd();
		this.explanationMd = draft.explanationMd();
		this.points = (short) draft.points();
		for (QuizAuthoring.ChoiceDraft choice : draft.choices()) {
			choices.add(new QuizChoice(this, choices.size() + 1, choice));
		}
	}

	Set<Long> correctChoiceIds() {
		return choices.stream().filter(QuizChoice::isCorrect).map(QuizChoice::getId).collect(Collectors.toSet());
	}

	Set<Long> choiceIds() {
		return choices.stream().map(QuizChoice::getId).collect(Collectors.toSet());
	}
}
