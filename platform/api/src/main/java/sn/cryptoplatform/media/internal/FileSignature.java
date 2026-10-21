package sn.cryptoplatform.media.internal;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Optional;

import sn.cryptoplatform.media.MediaKind;

/** Formats acceptés, reconnus à leurs premiers octets (« magic bytes »). */
enum FileSignature {

	MP4("video/mp4", MediaKind.VIDEO),
	WEBM("video/webm", MediaKind.VIDEO),
	PDF("application/pdf", MediaKind.PDF),
	PNG("image/png", MediaKind.IMAGE),
	JPEG("image/jpeg", MediaKind.IMAGE),
	WEBP("image/webp", MediaKind.IMAGE);

	static final int HEADER_LENGTH = 16;

	final String mimeType;
	final MediaKind kind;

	FileSignature(String mimeType, MediaKind kind) {
		this.mimeType = mimeType;
		this.kind = kind;
	}

	static Optional<FileSignature> detect(byte[] header) {
		if (startsWith(header, 0, "%PDF-".getBytes(StandardCharsets.US_ASCII))) {
			return Optional.of(PDF);
		}
		if (startsWith(header, 4, "ftyp".getBytes(StandardCharsets.US_ASCII))) {
			return Optional.of(MP4);
		}
		if (startsWith(header, 0, new byte[] { 0x1A, 0x45, (byte) 0xDF, (byte) 0xA3 })) {
			return Optional.of(WEBM);
		}
		if (startsWith(header, 0, new byte[] { (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A })) {
			return Optional.of(PNG);
		}
		if (startsWith(header, 0, new byte[] { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF })) {
			return Optional.of(JPEG);
		}
		if (startsWith(header, 0, "RIFF".getBytes(StandardCharsets.US_ASCII))
				&& startsWith(header, 8, "WEBP".getBytes(StandardCharsets.US_ASCII))) {
			return Optional.of(WEBP);
		}
		return Optional.empty();
	}

	private static boolean startsWith(byte[] data, int offset, byte[] prefix) {
		return data.length >= offset + prefix.length
				&& Arrays.equals(data, offset, offset + prefix.length, prefix, 0, prefix.length);
	}
}
