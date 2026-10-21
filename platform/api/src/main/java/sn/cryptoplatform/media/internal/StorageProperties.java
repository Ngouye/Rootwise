package sn.cryptoplatform.media.internal;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.util.unit.DataSize;

/**
 * @param type      {@code s3} (par défaut) ou {@code memory} (tests)
 * @param endpoint  URL du service S3 ; vide = AWS
 * @param pathStyle adresses de la forme endpoint/bucket/clé (SeaweedFS, MinIO…)
 */
@ConfigurationProperties("app.storage")
public record StorageProperties(
		@DefaultValue("s3") String type,
		String endpoint,
		@DefaultValue("us-east-1") String region,
		String accessKey,
		String secretKey,
		@DefaultValue("cryptoplatform-media") String bucket,
		@DefaultValue("true") boolean pathStyle,
		@DefaultValue Limits limits) {

	public record Limits(
			@DefaultValue("1GB") DataSize video,
			@DefaultValue("50MB") DataSize pdf,
			@DefaultValue("5MB") DataSize image) {
	}
}
