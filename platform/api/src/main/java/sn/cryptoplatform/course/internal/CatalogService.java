package sn.cryptoplatform.course.internal;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.cryptoplatform.course.CourseLevel;
import sn.cryptoplatform.user.PublicProfile;
import sn.cryptoplatform.user.UserService;

/** Catalogue public : seuls les cours publiés sont visibles. */
@Service
@Transactional(readOnly = true)
class CatalogService {

	private final CourseRepository courses;
	private final UserService users;

	CatalogService(CourseRepository courses, UserService users) {
		this.courses = courses;
		this.users = users;
	}

	List<CourseViews.CourseSummary> search(CourseLevel level, String tag, String query) {
		Specification<Course> published = (root, criteriaQuery, cb) -> {
			criteriaQuery.distinct(true);
			List<Predicate> predicates = new ArrayList<>();
			predicates.add(cb.equal(root.get("status"), Course.Status.PUBLISHED));
			if (level != null) {
				predicates.add(cb.equal(root.get("level"), level));
			}
			if (tag != null && !tag.isBlank()) {
				predicates.add(cb.equal(root.join("tags", JoinType.INNER).get("slug"), tag));
			}
			if (query != null && !query.isBlank()) {
				String pattern = "%" + query.trim().toLowerCase(Locale.ROOT).replace("%", "\\%").replace("_", "\\_") + "%";
				predicates.add(cb.or(cb.like(cb.lower(root.get("title")), pattern, '\\'),
						cb.like(cb.lower(root.get("summary")), pattern, '\\')));
			}
			return cb.and(predicates.toArray(Predicate[]::new));
		};
		List<Course> found = courses.findAll(published, Sort.by(Sort.Direction.DESC, "publishedAt"));
		if (found.isEmpty()) {
			return List.of();
		}
		Map<Long, PublicProfile> authors = users.findPublicProfiles(found.stream().map(Course::getAuthorId).toList());
		Map<Long, CourseStats> stats = courses.statsFor(found.stream().map(Course::getId).toList()).stream()
				.collect(Collectors.toMap(CourseStats::courseId, Function.identity()));
		return found.stream()
				.map(course -> CourseViews.CourseSummary.of(course, authors,
						stats.getOrDefault(course.getId(), CourseStats.empty(course.getId()))))
				.toList();
	}

	Optional<CourseViews.CourseDetail> findPublished(String slug) {
		return courses.findBySlug(slug)
				.filter(Course::isPublished)
				.map(course -> CourseViews.CourseDetail.of(course, users.findPublicProfiles(List.of(course.getAuthorId()))));
	}
}
