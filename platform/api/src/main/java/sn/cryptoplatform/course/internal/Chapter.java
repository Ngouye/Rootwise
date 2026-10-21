package sn.cryptoplatform.course.internal;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
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
import lombok.Setter;
import sn.cryptoplatform.course.CourseAuthoring;

@Entity
@Table(name = "chapters")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class Chapter {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "course_id")
	private Course course;

	@Setter
	private int position;

	@Setter
	private String title;

	@OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("position")
	private List<Lesson> lessons = new ArrayList<>();

	Chapter(Course course, int position, String title) {
		this.course = course;
		this.position = position;
		this.title = title;
	}

	Lesson addLesson(CourseAuthoring.LessonDraft draft) {
		Lesson lesson = new Lesson(this, lessons.size() + 1, draft);
		lessons.add(lesson);
		return lesson;
	}

	void removeLesson(Lesson lesson) {
		lessons.remove(lesson);
		renumber();
	}

	void move(Lesson lesson, int offset) {
		Positions.move(lessons, lesson, offset);
		renumber();
	}

	private void renumber() {
		for (int i = 0; i < lessons.size(); i++) {
			lessons.get(i).setPosition(i + 1);
		}
	}
}
