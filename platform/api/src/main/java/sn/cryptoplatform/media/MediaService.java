package sn.cryptoplatform.media;

import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

/** Point d'entrée du module médias pour les autres modules. */
public interface MediaService {

	/**
	 * Enregistre un fichier après avoir vérifié sa signature binaire (le type déclaré par le
	 * navigateur est ignoré) et sa taille maximale pour la catégorie demandée.
	 */
	MediaInfo store(long ownerId, MediaKind kind, String originalName, long size, InputStream content) throws IOException;

	Optional<MediaInfo> find(long mediaId);

	/**
	 * Réponse HTTP qui diffuse le fichier, avec prise en charge des requêtes partielles (Range),
	 * indispensables pour se déplacer dans une vidéo. L'appelant a déjà vérifié les droits d'accès.
	 */
	ResponseEntity<StreamingResponseBody> stream(MediaInfo media, String rangeHeader);
}
