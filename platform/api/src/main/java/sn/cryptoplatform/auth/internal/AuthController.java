package sn.cryptoplatform.auth.internal;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import sn.cryptoplatform.shared.web.ApiException;
import sn.cryptoplatform.user.UserService;

@RestController
@RequestMapping("/api/auth")
class AuthController {

	private final RegistrationService registration;
	private final LoginService login;
	private final PasswordResetService passwordReset;
	private final SessionService sessions;
	private final AuthCookies cookies;
	private final OAuthClients oauthClients;
	private final UserService users;

	AuthController(RegistrationService registration, LoginService login, PasswordResetService passwordReset,
			SessionService sessions, AuthCookies cookies, OAuthClients oauthClients, UserService users) {
		this.registration = registration;
		this.login = login;
		this.passwordReset = passwordReset;
		this.sessions = sessions;
		this.cookies = cookies;
		this.oauthClients = oauthClients;
		this.users = users;
	}

	/** Dépose le cookie XSRF-TOKEN que le site renvoie ensuite dans l'en-tête X-XSRF-TOKEN. */
	@GetMapping("/csrf")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void csrf(CsrfToken token) {
		token.getToken();
	}

	@GetMapping("/providers")
	List<String> providers() {
		return oauthClients.providers();
	}

	@PostMapping("/register")
	@ResponseStatus(HttpStatus.ACCEPTED)
	void register(@Valid @RequestBody AuthDtos.RegisterRequest body, HttpServletRequest request) {
		registration.register(body, request.getRemoteAddr());
	}

	@PostMapping("/verify-email")
	AuthDtos.MeResponse verifyEmail(@Valid @RequestBody AuthDtos.TokenRequest body, HttpServletResponse response) {
		return startSession(registration.verifyEmail(body.token()), response);
	}

	@PostMapping("/verify-email/resend")
	@ResponseStatus(HttpStatus.ACCEPTED)
	void resendVerification(@Valid @RequestBody AuthDtos.EmailRequest body, HttpServletRequest request) {
		registration.resendVerification(body.email(), request.getRemoteAddr());
	}

	@PostMapping("/login")
	AuthDtos.MeResponse login(@Valid @RequestBody AuthDtos.LoginRequest body, HttpServletRequest request,
			HttpServletResponse response) {
		return startSession(login.login(body.email(), body.password(), request.getRemoteAddr()), response);
	}

	@PostMapping("/refresh")
	AuthDtos.MeResponse refresh(HttpServletRequest request, HttpServletResponse response) {
		try {
			String refreshToken = AuthCookies.read(request, AuthCookies.REFRESH)
					.orElseThrow(() -> ApiException.unauthorized("SESSION_EXPIRED", "Session expirée, reconnectez-vous."));
			return startSession(sessions.refresh(refreshToken), response);
		} catch (ApiException e) {
			cookies.clear(response);
			throw e;
		}
	}

	@PostMapping("/logout")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void logout(HttpServletRequest request, HttpServletResponse response) {
		AuthCookies.read(request, AuthCookies.REFRESH).ifPresent(sessions::close);
		cookies.clear(response);
	}

	@GetMapping("/me")
	AuthDtos.MeResponse me(@AuthenticationPrincipal Jwt jwt) {
		return users.findById(Long.parseLong(jwt.getSubject()))
				.map(AuthDtos.MeResponse::of)
				.orElseThrow(() -> ApiException.unauthorized("SESSION_EXPIRED", "Session expirée, reconnectez-vous."));
	}

	@PostMapping("/password/forgot")
	@ResponseStatus(HttpStatus.ACCEPTED)
	void forgotPassword(@Valid @RequestBody AuthDtos.EmailRequest body, HttpServletRequest request) {
		passwordReset.requestReset(body.email(), request.getRemoteAddr());
	}

	@PostMapping("/password/reset")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void resetPassword(@Valid @RequestBody AuthDtos.ResetPasswordRequest body, HttpServletResponse response) {
		passwordReset.reset(body.token(), body.password());
		cookies.clear(response);
	}

	private AuthDtos.MeResponse startSession(SessionService.Session session, HttpServletResponse response) {
		cookies.write(response, session.tokens());
		return AuthDtos.MeResponse.of(session.user());
	}
}
