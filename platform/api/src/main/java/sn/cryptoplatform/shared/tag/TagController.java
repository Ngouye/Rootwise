package sn.cryptoplatform.shared.tag;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class TagController {

	record TagView(String slug, String name) {
	}

	private final TagRepository tags;

	TagController(TagRepository tags) {
		this.tags = tags;
	}

	@GetMapping("/api/public/tags")
	List<TagView> list() {
		return tags.findAllByOrderByNameAsc().stream().map(tag -> new TagView(tag.getSlug(), tag.getName())).toList();
	}
}
