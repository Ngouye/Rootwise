package sn.cryptoplatform.course.internal;

import java.text.Normalizer;
import java.util.Locale;

/** « Chiffrement symétrique : AES » -> « chiffrement-symetrique-aes ». */
final class Slugs {

	private Slugs() {
	}

	static String from(String title) {
		String ascii = Normalizer.normalize(title, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
		String slug = ascii.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
		if (slug.length() > 80) {
			slug = slug.substring(0, 80).replaceAll("-$", "");
		}
		return slug.isEmpty() ? "cours" : slug;
	}
}
