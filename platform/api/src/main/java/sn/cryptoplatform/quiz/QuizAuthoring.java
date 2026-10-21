package sn.cryptoplatform.quiz;

import java.util.List;

/** Création des quiz de fin de chapitre (studio, jeu de démonstration). */
public interface QuizAuthoring {

	enum QuestionKind {
		/** Une seule bonne réponse. */
		SINGLE,
		/** Plusieurs bonnes réponses : il faut toutes les cocher, et seulement elles. */
		MULTIPLE
	}

	record ChoiceDraft(String labelMd, boolean correct) {
	}

	record QuestionDraft(QuestionKind kind, String promptMd, String explanationMd, int points, List<ChoiceDraft> choices) {
	}

	record QuizDraft(int passScorePct, Integer maxAttempts, List<QuestionDraft> questions) {
	}

	/** Crée ou remplace le quiz du chapitre ; les tentatives déjà réussies restent acquises. */
	void saveQuiz(long chapterId, QuizDraft draft);
}
