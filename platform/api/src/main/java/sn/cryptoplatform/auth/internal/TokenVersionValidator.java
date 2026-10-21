package sn.cryptoplatform.auth.internal;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import sn.cryptoplatform.user.UserService;

/**
 * Refuse un JWT dont le compte est suspendu ou dont la version ({@code ver}) est dépassée :
 * changer de mot de passe ou suspendre un compte coupe immédiatement les sessions ouvertes.
 */
@Component
class TokenVersionValidator implements OAuth2TokenValidator<Jwt> {

	private static final OAuth2TokenValidatorResult REVOKED = OAuth2TokenValidatorResult.failure(
			new OAuth2Error(OAuth2ErrorCodes.INVALID_TOKEN, "Session révoquée", null));

	private final UserService users;

	TokenVersionValidator(UserService users) {
		this.users = users;
	}

	@Override
	public OAuth2TokenValidatorResult validate(Jwt jwt) {
		Object version = jwt.getClaims().get("ver");
		long userId;
		try {
			userId = Long.parseLong(jwt.getSubject());
		} catch (NumberFormatException e) {
			return REVOKED;
		}
		if (!(version instanceof Number number)) {
			return REVOKED;
		}
		return users.findById(userId)
				.filter(user -> user.isActive() && user.tokenVersion() == number.intValue())
				.map(user -> OAuth2TokenValidatorResult.success())
				.orElse(REVOKED);
	}
}
