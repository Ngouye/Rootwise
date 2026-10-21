package sn.cryptoplatform.shared.tag;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, Long> {

	List<Tag> findAllByOrderByNameAsc();

	List<Tag> findBySlugIn(Collection<String> slugs);
}
