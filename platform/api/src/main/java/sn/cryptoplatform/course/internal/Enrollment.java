package sn.cryptoplatform.course.internal;

import java.io.Serializable;
import java.time.Instant;

import jakarta.persistence.Column;
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
@Table(name = "enrollments")
@IdClass(Enrollment.Key.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class Enrollment {

	@NoArgsConstructor
	@AllArgsConstructor
	@EqualsAndHashCode
	static class Key implements Serializable {
		private Long userId;
		private Long courseId;
	}

	@Id
	private Long userId;

	@Id
	private Long courseId;

	@Column(name = "progress_pct")
	private short progressPct;

	private Long lastLessonId;

	private Instant enrolledAt;

	private Instant completedAt;

	Enrollment(long userId, long courseId) {
		this.userId = userId;
		this.courseId = courseId;
		this.enrolledAt = Instant.now();
	}

	void recordVisit(long lessonId) {
		lastLessonId = lessonId;
	}

	/** Met à jour le pourcentage ; renvoie true la première fois que le cours atteint 100 %. */
	boolean updateProgress(int completed, int total) {
		progressPct = (short) (total == 0 ? 0 : Math.round(100f * completed / total));
		if (total > 0 && completed >= total && completedAt == null) {
			completedAt = Instant.now();
			return true;
		}
		return false;
	}
}
