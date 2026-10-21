package sn.cryptoplatform.media;

/** Métadonnées d'un fichier stocké ; le contenu se lit via {@link MediaService#stream}. */
public record MediaInfo(long id, Long ownerId, MediaKind kind, String originalName, String mimeType, long sizeBytes) {
}
