package sn.cryptoplatform.user.internal;

import java.io.IOException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import sn.cryptoplatform.media.MediaInfo;
import sn.cryptoplatform.media.MediaKind;
import sn.cryptoplatform.media.MediaService;
import sn.cryptoplatform.shared.security.CurrentUser;
import sn.cryptoplatform.shared.web.ApiException;
import sn.cryptoplatform.user.PublicProfile;
import sn.cryptoplatform.user.UserService;

/** Profil public des membres (formateurs) et modification de son propre profil. */
@RestController
class ProfileController {

	private final UserService users;
	private final MediaService media;

	ProfileController(UserService users, MediaService media) {
		this.users = users;
		this.media = media;
	}

	@GetMapping("/api/public/users/{username}")
	PublicProfile profile(@PathVariable String username) {
		return users.findPublicProfile(username)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Membre introuvable."));
	}

	@PutMapping("/api/me/profile")
	PublicProfile updateProfile(@Valid @RequestBody ProfileRequest body) {
		return users.updateProfile(CurrentUser.id(), body.displayName(), body.headline(), body.bio());
	}

	/** Photo de profil : PNG, JPEG ou WebP, vérifiée par signature binaire comme toute image. */
	@PostMapping("/api/me/avatar")
	PublicProfile uploadAvatar(@RequestParam MultipartFile file) throws IOException {
		long userId = CurrentUser.id();
		MediaInfo image = media.store(userId, MediaKind.IMAGE, file.getOriginalFilename(), file.getSize(), file.getInputStream());
		return users.changeAvatar(userId, image.id());
	}

	@DeleteMapping("/api/me/avatar")
	PublicProfile removeAvatar() {
		return users.changeAvatar(CurrentUser.id(), null);
	}

	record ProfileRequest(
			@NotBlank(message = "Champ obligatoire.") @Size(min = 2, max = 50, message = "Entre 2 et 50 caractères.") String displayName,
			@Size(max = 120, message = "120 caractères au maximum.") String headline,
			@Size(max = 600, message = "600 caractères au maximum.") String bio) {
	}
}
