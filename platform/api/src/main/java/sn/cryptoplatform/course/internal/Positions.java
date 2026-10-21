package sn.cryptoplatform.course.internal;

import java.util.Collections;
import java.util.List;

/** Déplacement d'un élément d'une liste ordonnée (chapitres, leçons) vers le haut ou le bas. */
final class Positions {

	private Positions() {
	}

	static <T> void move(List<T> items, T item, int offset) {
		int from = items.indexOf(item);
		int to = from + offset;
		if (from < 0 || to < 0 || to >= items.size()) {
			return;
		}
		Collections.swap(items, from, to);
	}
}
