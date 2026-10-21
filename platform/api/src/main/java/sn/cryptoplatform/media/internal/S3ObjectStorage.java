package sn.cryptoplatform.media.internal;

import java.io.InputStream;
import java.net.URI;

import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.checksums.RequestChecksumCalculation;
import software.amazon.awssdk.core.checksums.ResponseChecksumValidation;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;

/**
 * Stockage S3 (AWS, Cloudflare R2, SeaweedFS en local…). Les fichiers ne sont jamais servis
 * directement par S3 : l'API les relaie après avoir vérifié les droits du membre.
 */
@Component
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3", matchIfMissing = true)
class S3ObjectStorage implements ObjectStorage {

	private static final Logger log = LoggerFactory.getLogger(S3ObjectStorage.class);

	private final S3Client s3;
	private final String bucket;

	S3ObjectStorage(StorageProperties properties) {
		this.s3 = client(properties);
		this.bucket = properties.bucket();
	}

	@Override
	public void put(String key, String contentType, long size, InputStream content) {
		s3.putObject(request -> request.bucket(bucket).key(key).contentType(contentType).contentLength(size),
				RequestBody.fromInputStream(content, size));
	}

	@Override
	public InputStream read(String key, long start, long end) {
		return s3.getObject(request -> request.bucket(bucket).key(key).range("bytes=" + start + "-" + end));
	}

	@Override
	public void delete(String key) {
		s3.deleteObject(request -> request.bucket(bucket).key(key));
	}

	/** En développement, le bucket est créé au démarrage s'il n'existe pas encore. */
	@EventListener(ApplicationReadyEvent.class)
	void ensureBucket() {
		try {
			s3.headBucket(request -> request.bucket(bucket));
		} catch (NoSuchBucketException missing) {
			s3.createBucket(request -> request.bucket(bucket));
			log.info("Bucket S3 « {} » créé", bucket);
		} catch (RuntimeException unavailable) {
			log.warn("Stockage S3 injoignable au démarrage ({}) : les envois de fichiers échoueront", unavailable.getMessage());
		}
	}

	private static S3Client client(StorageProperties properties) {
		S3ClientBuilder builder = S3Client.builder()
				.region(Region.of(properties.region()))
				.forcePathStyle(properties.pathStyle())
				// Les sommes de contrôle ajoutées par défaut depuis le SDK 2.30 ne sont pas
				// comprises par tous les services compatibles S3 : seulement quand l'API l'exige.
				.requestChecksumCalculation(RequestChecksumCalculation.WHEN_REQUIRED)
				.responseChecksumValidation(ResponseChecksumValidation.WHEN_REQUIRED);
		if (properties.endpoint() != null && !properties.endpoint().isBlank()) {
			builder.endpointOverride(URI.create(properties.endpoint()));
		}
		if (properties.accessKey() != null && !properties.accessKey().isBlank()) {
			builder.credentialsProvider(StaticCredentialsProvider.create(
					AwsBasicCredentials.create(properties.accessKey(), properties.secretKey())));
		} else {
			builder.credentialsProvider(DefaultCredentialsProvider.builder().build());
		}
		return builder.build();
	}

	/** Fermeture propre du client HTTP à l'arrêt. */
	@PreDestroy
	void close() {
		s3.close();
	}
}
