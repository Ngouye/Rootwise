package sn.cryptoplatform.course.internal;

import java.io.Serializable;
import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lesson_progress")
@IdClass(LessonProgress.Key.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class LessonProgress {

	@NoArgsConstructor
	@AllArgsConstructor
	@EqualsAndHashCode
	static class Key implements Serializable {
		private Long userId;
		private Long lessonId;
	}

	@Id
	private Long userId;

	@Id
	private Long lessonId;

	private int positionSeconds;

	private Instant completedAt;

	private Instant updatedAt;

	LessonProgress(long userId, long lessonId) {
		this.userId = userId;
		this.lessonId = lessonId;
		this.updatedAt = Instant.now();
	}

	/** Enregistre la position ; renvoie true si la leçon vient d'être terminée pour la première fois. */
	boolean record(int positionSeconds, boolean completed) {
		this.positionSeconds = Math.max(0, positionSeconds);
		this.updatedAt = Instant.now();
		if (completed && completedAt == null) {
			completedAt = updatedAt;
			return true;
		}
		return false;
	}

	boolean isCompleted() {
		return completedAt != null;
	}
}
