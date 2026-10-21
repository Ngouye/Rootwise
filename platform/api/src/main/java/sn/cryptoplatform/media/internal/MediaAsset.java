package sn.cryptoplatform.media.internal;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import sn.cryptoplatform.media.MediaInfo;
import sn.cryptoplatform.media.MediaKind;

@Entity
@Table(name = "media_assets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class MediaAsset {

	enum Status {
		PENDING, READY, FAILED
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private Long ownerId;

	@Enumerated(EnumType.STRING)
	private MediaKind kind;

	private String storageKey;

	private String originalName;

	private String mimeType;

	private long sizeBytes;

	private byte[] sha256;

	private Integer durationSeconds;

	@Enumerated(EnumType.STRING)
	private Status status;

	private Instant createdAt;

	MediaAsset(long ownerId, MediaKind kind, String storageKey, String originalName, String mimeType, long sizeBytes,
			byte[] sha256) {
		this.ownerId = ownerId;
		this.kind = kind;
		this.storageKey = storageKey;
		this.originalName = originalName;
		this.mimeType = mimeType;
		this.sizeBytes = sizeBytes;
		this.sha256 = sha256;
		this.status = Status.READY;
		this.createdAt = Instant.now();
	}

	MediaInfo toInfo() {
		return new MediaInfo(id, ownerId, kind, originalName, mimeType, sizeBytes);
	}
}
