package sn.cryptoplatform.user;

/** Ce que tout visiteur peut voir d'un membre : auteur d'un cours, formateur, etc. Jamais l'e-mail. */
public record PublicProfile(long id, String username, String displayName, String headline, String bio, String avatarUrl) {

	/** Adresse publique d'une image stockée par le module médias. */
	public static String avatarUrl(Long mediaId) {
		return mediaId == null ? null : "/api/public/media/" + mediaId;
	}
}
