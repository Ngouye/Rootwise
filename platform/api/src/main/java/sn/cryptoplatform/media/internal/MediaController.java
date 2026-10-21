package sn.cryptoplatform.media.internal;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import sn.cryptoplatform.media.MediaInfo;
import sn.cryptoplatform.media.MediaKind;
import sn.cryptoplatform.media.MediaService;
import sn.cryptoplatform.shared.security.CurrentUser;
import sn.cryptoplatform.shared.web.ApiException;

@RestController
class MediaController {

	private final MediaService media;

	MediaController(MediaService media) {
		this.media = media;
	}

	/** Envoi d'un fichier depuis le studio ; il sera ensuite rattaché à une leçon ou à un cours. */
	@PostMapping("/api/studio/media")
	@PreAuthorize("hasAnyRole('CREATOR', 'ADMIN')")
	@ResponseStatus(HttpStatus.CREATED)
	MediaInfo upload(@RequestParam MultipartFile file, @RequestParam MediaKind kind) throws IOException {
		return media.store(CurrentUser.id(), kind, file.getOriginalFilename(), file.getSize(), file.getInputStream());
	}

	/** Seules les images (couvertures de cours) sont publiques ; vidéos et PDF passent par les leçons. */
	@GetMapping("/api/public/media/{id}")
	ResponseEntity<StreamingResponseBody> publicImage(@PathVariable long id,
			@RequestHeader(value = HttpHeaders.RANGE, required = false) String range) {
		MediaInfo image = media.find(id)
				.filter(found -> found.kind() == MediaKind.IMAGE)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MEDIA_NOT_FOUND", "Fichier introuvable."));
		return media.stream(image, range);
	}
}
