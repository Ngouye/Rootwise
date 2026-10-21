package sn.cryptoplatform.shared.web;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Toutes les erreurs de l'API sortent en {@code application/problem+json} avec une propriété
 * {@code code} ; les erreurs de validation ajoutent {@code errors} (champ -> message).
 */
@RestControllerAdvice
class ApiExceptionHandler extends ResponseEntityExceptionHandler {

	@ExceptionHandler(ApiException.class)
	ResponseEntity<ProblemDetail> handleApiException(ApiException ex) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(ex.status(), ex.getMessage());
		problem.setProperty("code", ex.code());

		ResponseEntity.BodyBuilder response = ResponseEntity.status(ex.status());
		if (ex.retryAfter() != null) {
			response.header(HttpHeaders.RETRY_AFTER, String.valueOf(Math.max(1, ex.retryAfter().toSeconds())));
		}
		return response.body(problem);
	}

	@Override
	protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
			HttpHeaders headers, HttpStatusCode status, WebRequest request) {
		Map<String, String> errors = new LinkedHashMap<>();
		for (FieldError error : ex.getBindingResult().getFieldErrors()) {
			errors.putIfAbsent(error.getField(), error.getDefaultMessage());
		}
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Certains champs sont invalides.");
		problem.setProperty("code", "VALIDATION_ERROR");
		problem.setProperty("errors", errors);
		return ResponseEntity.badRequest().body(problem);
	}

	@Override
	protected ResponseEntity<Object> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex,
			HttpHeaders headers, HttpStatusCode status, WebRequest request) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONTENT_TOO_LARGE,
				"Fichier trop volumineux pour être envoyé.");
		problem.setProperty("code", "FILE_TOO_LARGE");
		return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE).body(problem);
	}
}
