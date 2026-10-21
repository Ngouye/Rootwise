package sn.cryptoplatform.course.internal;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import sn.cryptoplatform.course.CourseLevel;
import sn.cryptoplatform.shared.web.ApiException;

/** Catalogue ouvert à tous (visiteurs compris) : ce sont les pages que les moteurs de recherche indexent. */
@RestController
class CatalogController {

	private final CatalogService catalog;

	CatalogController(CatalogService catalog) {
		this.catalog = catalog;
	}

	@GetMapping("/api/public/courses")
	List<CourseViews.CourseSummary> search(@RequestParam(required = false) CourseLevel level,
			@RequestParam(required = false) String tag, @RequestParam(required = false) String q) {
		return catalog.search(level, tag, q);
	}

	@GetMapping("/api/public/courses/{slug}")
	CourseViews.CourseDetail detail(@PathVariable String slug) {
		return catalog.findPublished(slug)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "COURSE_NOT_FOUND", "Cours introuvable."));
	}
}
