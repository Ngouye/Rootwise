package sn.cryptoplatform.course.internal;

import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Extrait l'identifiant d'une vidéo YouTube (11 caractères) de ses différentes formes d'URL. */
final class YouTube {

	private static final Pattern ID = Pattern.compile("^[A-Za-z0-9_-]{11}$");
	private static final Pattern URL = Pattern.compile(
			"^https?://(?:www\\.|m\\.)?(?:youtube\\.com/(?:watch\\?(?:.*&)?v=|embed/|shorts/|live/)|youtube-nocookie\\.com/embed/|youtu\\.be/)([A-Za-z0-9_-]{11})(?:[?&#/].*)?$");

	private YouTube() {
	}

	static Optional<String> videoId(String urlOrId) {
		if (urlOrId == null) {
			return Optional.empty();
		}
		String value = urlOrId.trim();
		if (ID.matcher(value).matches()) {
			return Optional.of(value);
		}
		Matcher matcher = URL.matcher(value);
		return matcher.matches() ? Optional.of(matcher.group(1)) : Optional.empty();
	}
}
