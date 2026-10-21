package sn.cryptoplatform.course.internal;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sn.cryptoplatform.course.CourseLevel;
import sn.cryptoplatform.shared.tag.Tag;

@Entity
@Table(name = "courses")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class Course {

	enum Status {
		DRAFT, PUBLISHED, ARCHIVED
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String slug;

	@Setter
	private String title;

	@Setter
	private String summary;

	@Setter
	private String descriptionMd;

	@Setter
	@Enumerated(EnumType.STRING)
	private CourseLevel level;

	private Long authorId;

	@Setter
	private Long coverMediaId;

	@Enumerated(EnumType.STRING)
	private Status status = Status.DRAFT;

	private Instant publishedAt;

	private Instant createdAt;

	private Instant updatedAt;

	@ManyToMany
	@JoinTable(name = "course_tags", joinColumns = @JoinColumn(name = "course_id"),
			inverseJoinColumns = @JoinColumn(name = "tag_id"))
	private Set<Tag> tags = new HashSet<>();

	@OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("position")
	private List<Chapter> chapters = new ArrayList<>();

	Course(long authorId, String slug, String title, String summary, CourseLevel level) {
		this.authorId = authorId;
		this.slug = slug;
		this.title = title;
		this.summary = summary;
		this.level = level;
	}

	boolean isPublished() {
		return status == Status.PUBLISHED;
	}

	/** Un administrateur peut attribuer le cours à un autre créateur. */
	void changeAuthor(long newAuthorId) {
		authorId = newAuthorId;
	}

	void publish() {
		status = Status.PUBLISHED;
		if (publishedAt == null) {
			publishedAt = Instant.now();
		}
	}

	void unpublish() {
		status = Status.DRAFT;
	}

	void replaceTags(Set<Tag> newTags) {
		tags.clear();
		tags.addAll(newTags);
	}

	Chapter addChapter(String title) {
		Chapter chapter = new Chapter(this, chapters.size() + 1, title);
		chapters.add(chapter);
		return chapter;
	}

	void removeChapter(Chapter chapter) {
		chapters.remove(chapter);
		renumber();
	}

	void move(Chapter chapter, int offset) {
		Positions.move(chapters, chapter, offset);
		renumber();
	}

	List<Lesson> lessons() {
		return chapters.stream().flatMap(chapter -> chapter.getLessons().stream()).toList();
	}

	private void renumber() {
		for (int i = 0; i < chapters.size(); i++) {
			chapters.get(i).setPosition(i + 1);
		}
	}

	@PrePersist
	void onCreate() {
		createdAt = updatedAt = Instant.now();
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = Instant.now();
	}
}
