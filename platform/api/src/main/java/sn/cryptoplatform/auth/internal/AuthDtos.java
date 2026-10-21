package sn.cryptoplatform.auth.internal;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import sn.cryptoplatform.user.UserAccount;

/** Corps des requêtes et réponses de /api/auth. */
final class AuthDtos {

	private AuthDtos() {
	}

	private static final String REQUIRED = "Champ obligatoire.";
	private static final String INVALID_EMAIL = "Adresse e-mail invalide.";
	private static final String PASSWORD_SIZE = "Le mot de passe doit contenir entre 12 et 128 caractères.";

	record RegisterRequest(
			@NotBlank(message = REQUIRED) @Email(message = INVALID_EMAIL) @Size(max = 254, message = INVALID_EMAIL) String email,
			@NotBlank(message = REQUIRED)
			@Pattern(regexp = "^[a-zA-Z0-9_.-]{3,30}$", message = "3 à 30 caractères : lettres, chiffres, point, tiret ou tiret bas.")
			String username,
			@NotBlank(message = REQUIRED) @Size(min = 2, max = 50, message = "Entre 2 et 50 caractères.") String displayName,
			@NotBlank(message = REQUIRED) @Size(min = 12, max = 128, message = PASSWORD_SIZE) String password) {
	}

	record LoginRequest(
			@NotBlank(message = REQUIRED) @Email(message = INVALID_EMAIL) String email,
			@NotBlank(message = REQUIRED) @Size(max = 128, message = PASSWORD_SIZE) String password) {
	}

	record EmailRequest(@NotBlank(message = REQUIRED) @Email(message = INVALID_EMAIL) String email) {
	}

	record TokenRequest(@NotBlank(message = REQUIRED) @Size(max = 100) String token) {
	}

	record ResetPasswordRequest(
			@NotBlank(message = REQUIRED) @Size(max = 100) String token,
			@NotBlank(message = REQUIRED) @Size(min = 12, max = 128, message = PASSWORD_SIZE) String password) {
	}

	/** Profil du membre connecté : jamais de hash, de jeton ni de version de jeton. */
	record MeResponse(long id, String username, String displayName, String email, String expertiseLevel,
			List<String> roles, boolean emailVerified, String headline, String bio, String avatarUrl) {

		static MeResponse of(UserAccount user) {
			return new MeResponse(user.id(), user.username(), user.displayName(), user.email(),
					user.expertiseLevel().name(), user.roles().stream().map(Enum::name).sorted().toList(),
					user.emailVerified(), user.profile().headline(), user.profile().bio(), user.profile().avatarUrl());
		}
	}
}
