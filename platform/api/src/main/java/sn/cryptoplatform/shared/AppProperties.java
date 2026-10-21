package sn.cryptoplatform.shared;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Réglages communs à toute l'application.
 *
 * @param name      nom affiché dans les e-mails
 * @param publicUrl URL publique du site (liens des e-mails, redirections OAuth)
 * @param mailFrom  expéditeur des e-mails
 */
@ConfigurationProperties("app")
public record AppProperties(
		@DefaultValue("CryptoPlatform") String name,
		@DefaultValue("http://localhost:3000") String publicUrl,
		@DefaultValue("CryptoPlatform <no-reply@cryptoplatform.local>") String mailFrom) {

	/** URL absolue d'une page du site, par exemple {@code url("/connexion")}. */
	public String url(String path) {
		return publicUrl.replaceAll("/+$", "") + path;
	}
}
