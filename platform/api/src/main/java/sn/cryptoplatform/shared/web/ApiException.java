package sn.cryptoplatform.shared.web;

import java.time.Duration;

import org.springframework.http.HttpStatus;

/**
 * Erreur métier renvoyée au client au format RFC 9457 : un statut HTTP, un code stable
 * que le frontend peut tester, et un message lisible en français.
 */
public class ApiException extends RuntimeException {

	private final HttpStatus status;
	private final String code;
	private final Duration retryAfter;

	public ApiException(HttpStatus status, String code, String detail) {
		this(status, code, detail, null);
	}

	public ApiException(HttpStatus status, String code, String detail, Duration retryAfter) {
		super(detail);
		this.status = status;
		this.code = code;
		this.retryAfter = retryAfter;
	}

	public static ApiException badRequest(String code, String detail) {
		return new ApiException(HttpStatus.BAD_REQUEST, code, detail);
	}

	public static ApiException unauthorized(String code, String detail) {
		return new ApiException(HttpStatus.UNAUTHORIZED, code, detail);
	}

	public static ApiException forbidden(String code, String detail) {
		return new ApiException(HttpStatus.FORBIDDEN, code, detail);
	}

	public static ApiException conflict(String code, String detail) {
		return new ApiException(HttpStatus.CONFLICT, code, detail);
	}

	public HttpStatus status() {
		return status;
	}

	public String code() {
		return code;
	}

	public Duration retryAfter() {
		return retryAfter;
	}
}
