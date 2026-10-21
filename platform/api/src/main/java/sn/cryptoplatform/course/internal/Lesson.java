package sn.cryptoplatform.course.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import lombok.Setter;
import sn.cryptoplatform.course.CourseAuthoring;
import sn.cryptoplatform.course.LessonType;

@Entity
@Table(name = "lessons")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class Lesson {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "chapter_id")
	private Chapter chapter;

	@Setter
	private int position;

	private String title;

	@Enumerated(EnumType.STRING)
	private LessonType type;

	private String contentMd;

	private Long mediaId;

	private String youtubeId;

	private Integer durationSeconds;

	@Column(name = "is_free_preview")
	private boolean freePreview;

	Lesson(Chapter chapter, int position, CourseAuthoring.LessonDraft draft) {
		this.chapter = chapter;
		this.position = position;
		apply(draft);
	}

	/**
	 * Le texte sert de contenu (TEXT) ou de notes (autres types) ; seul le support qui correspond
	 * au type est conservé : fichier pour VIDEO/PDF, identifiant pour YOUTUBE.
	 */
	void apply(CourseAuthoring.LessonDraft draft) {
		this.title = draft.title().trim();
		this.type = draft.type();
		this.contentMd = draft.contentMd() == null || draft.contentMd().isBlank() ? null : draft.contentMd();
		this.mediaId = draft.type() == LessonType.VIDEO || draft.type() == LessonType.PDF ? draft.mediaId() : null;
		this.youtubeId = draft.type() == LessonType.YOUTUBE ? draft.youtubeId() : null;
		this.durationSeconds = draft.durationSeconds();
		this.freePreview = draft.freePreview();
	}
}
