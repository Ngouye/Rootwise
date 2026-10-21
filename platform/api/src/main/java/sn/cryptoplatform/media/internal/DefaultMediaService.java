package sn.cryptoplatform.media.internal;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import sn.cryptoplatform.media.MediaInfo;
import sn.cryptoplatform.media.MediaKind;
import sn.cryptoplatform.media.MediaService;
import sn.cryptoplatform.shared.web.ApiException;

@Service
class DefaultMediaService implements MediaService {

	private final MediaAssetRepository assets;
	private final ObjectStorage storage;
	private final StorageProperties properties;

	DefaultMediaService(MediaAssetRepository assets, ObjectStorage storage, StorageProperties properties) {
		this.assets = assets;
		this.storage = storage;
		this.properties = properties;
	}

	@Override
	public MediaInfo store(long ownerId, MediaKind kind, String originalName, long size, InputStream content)
			throws IOException {
		long maximum = maximumSize(kind);
		if (size <= 0) {
			throw ApiException.badRequest("EMPTY_FILE", "Le fichier est vide.");
		}
		if (size > maximum) {
			throw new ApiException(HttpStatus.CONTENT_TOO_LARGE, "FILE_TOO_LARGE",
					"Fichier trop volumineux : " + (maximum / (1024 * 1024)) + " Mo au maximum pour ce type.");
		}

		BufferedInputStream buffered = new BufferedInputStream(content);
		buffered.mark(FileSignature.HEADER_LENGTH);
		byte[] header = buffered.readNBytes(FileSignature.HEADER_LENGTH);
		buffered.reset();
		FileSignature signature = FileSignature.detect(header)
				.filter(detected -> detected.kind == kind)
				.orElseThrow(() -> ApiException.badRequest("UNSUPPORTED_FILE", switch (kind) {
					case VIDEO -> "Format vidéo non accepté : MP4 ou WebM uniquement.";
					case PDF -> "Ce fichier n'est pas un PDF.";
					case IMAGE -> "Format d'image non accepté : PNG, JPEG ou WebP uniquement.";
				}));

		MessageDigest sha256 = sha256();
		String key = kind.name().toLowerCase() + "/" + YearMonth.now() + "/" + UUID.randomUUID();
		storage.put(key, signature.mimeType, size, new DigestInputStream(buffered, sha256));

		MediaAsset asset;
		try {
			asset = assets.save(new MediaAsset(ownerId, kind, key, cleanName(originalName), signature.mimeType,
					size, sha256.digest()));
		} catch (RuntimeException failure) {
			// Fiche non enregistrée (base injoignable, connexion coupée…) : le fichier déjà envoyé est
			// retiré du stockage, sinon il y resterait orphelin, invisible et jamais supprimé.
			try {
				storage.delete(key);
			} catch (RuntimeException cleanup) {
				failure.addSuppressed(cleanup);
			}
			throw failure;
		}
		return asset.toInfo();
	}

	@Override
	public Optional<MediaInfo> find(long mediaId) {
		return assets.findById(mediaId)
				.filter(asset -> asset.getStatus() == MediaAsset.Status.READY)
				.map(MediaAsset::toInfo);
	}

	@Override
	public ResponseEntity<StreamingResponseBody> stream(MediaInfo media, String rangeHeader) {
		MediaAsset asset = assets.findById(media.id())
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MEDIA_NOT_FOUND", "Fichier introuvable."));
		long total = asset.getSizeBytes();

		HttpHeaders headers = new HttpHeaders();
		headers.set(HttpHeaders.ACCEPT_RANGES, "bytes");
		headers.setContentType(MediaType.parseMediaType(asset.getMimeType()));
		headers.setCacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePrivate());
		headers.setContentDisposition(ContentDisposition.inline()
				.filename(asset.getOriginalName(), StandardCharsets.UTF_8).build());

		long start = 0;
		long end = total - 1;
		HttpStatus status = HttpStatus.OK;
		if (rangeHeader != null && !rangeHeader.isBlank()) {
			try {
				List<HttpRange> ranges = HttpRange.parseRanges(rangeHeader);
				if (ranges.size() == 1) {
					start = ranges.get(0).getRangeStart(total);
					end = ranges.get(0).getRangeEnd(total);
					status = HttpStatus.PARTIAL_CONTENT;
					headers.set(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + total);
				}
			} catch (IllegalArgumentException unsatisfiable) {
				return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
						.header(HttpHeaders.CONTENT_RANGE, "bytes */" + total)
						.build();
			}
		}
		headers.setContentLength(end - start + 1);

		String key = asset.getStorageKey();
		long from = start;
		long to = end;
		StreamingResponseBody body = output -> {
			try (InputStream input = storage.read(key, from, to)) {
				input.transferTo(output);
			}
		};
		return new ResponseEntity<>(body, headers, status);
	}

	private long maximumSize(MediaKind kind) {
		return switch (kind) {
			case VIDEO -> properties.limits().video().toBytes();
			case PDF -> properties.limits().pdf().toBytes();
			case IMAGE -> properties.limits().image().toBytes();
		};
	}

	/** Nom affiché seulement (en-tête Content-Disposition) : jamais utilisé comme chemin. */
	private static String cleanName(String name) {
		String cleaned = name == null ? "" : name.replaceAll("[\\p{Cntrl}/\\\\]", "_").trim();
		if (cleaned.isEmpty()) {
			cleaned = "fichier";
		}
		return cleaned.length() > 200 ? cleaned.substring(cleaned.length() - 200) : cleaned;
	}

	private static MessageDigest sha256() {
		try {
			return MessageDigest.getInstance("SHA-256");
		} catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException(e);
		}
	}
}
