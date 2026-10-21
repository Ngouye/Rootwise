package sn.cryptoplatform.media.internal;

import java.io.IOException;
import java.io.InputStream;

/** Stockage d'objets (S3 en vrai, mémoire pour les tests). Les clés sont toujours générées par le serveur. */
public interface ObjectStorage {

	void put(String key, String contentType, long size, InputStream content) throws IOException;

	/** Lit tout l'objet, ou seulement les octets [start, end] inclus. */
	InputStream read(String key, long start, long end) throws IOException;

	void delete(String key);
}
