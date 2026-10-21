package sn.cryptoplatform;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;

import jakarta.servlet.http.Cookie;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.assertj.MvcTestResult;

/**
 * Navigateur simulé : garde les cookies de session et envoie le jeton CSRF comme le site
 * (cookie XSRF-TOKEN recopié dans l'en-tête X-XSRF-TOKEN).
 */
public class TestSession {

	private final MockMvcTester mvc;
	private final List<Cookie> cookies = new ArrayList<>();

	private TestSession(MockMvcTester mvc) {
		this.mvc = mvc;
	}

	public static TestSession anonymous(MockMvcTester mvc) {
		return new TestSession(mvc);
	}

	public static TestSession login(MockMvcTester mvc, String email, String password) {
		TestSession session = new TestSession(mvc);
		MvcTestResult result = session.post("/api/auth/login", "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password));
		assertThat(result).hasStatusOk();
		session.cookies.add(result.getResponse().getCookie("access_token"));
		session.cookies.add(result.getResponse().getCookie("refresh_token"));
		return session;
	}

	public MvcTestResult get(String path) {
		return withCookies(mvc.get().uri(path)).exchange();
	}

	public MvcTestResult getRange(String path, String range) {
		return withCookies(mvc.get().uri(path).header("Range", range)).exchange();
	}

	/** {@code cookie(...)} refuse une liste vide : un visiteur anonyme n'en envoie aucun. */
	private MockMvcTester.MockMvcRequestBuilder withCookies(MockMvcTester.MockMvcRequestBuilder request) {
		return cookies.isEmpty() ? request : request.cookie(cookies.toArray(Cookie[]::new));
	}

	public MvcTestResult post(String path, String json) {
		return send(mvc.post().uri(path), json);
	}

	public MvcTestResult put(String path, String json) {
		return send(mvc.put().uri(path), json);
	}

	public MvcTestResult delete(String path) {
		return send(mvc.delete().uri(path), "");
	}

	public MvcTestResult upload(String filename, String kind, byte[] content) {
		Cookie xsrf = xsrf();
		return mvc.post().uri("/api/studio/media")
				.multipart()
				.file(new MockMultipartFile("file", filename, MediaType.APPLICATION_OCTET_STREAM_VALUE, content))
				.param("kind", kind)
				.header("X-XSRF-TOKEN", xsrf.getValue())
				.cookie(withXsrf(xsrf))
				.exchange();
	}

	/** Envoi d'un fichier seul (champ « file ») vers une autre adresse, par exemple la photo de profil. */
	public MvcTestResult uploadFile(String path, String filename, byte[] content) {
		Cookie xsrf = xsrf();
		return mvc.post().uri(path)
				.multipart()
				.file(new MockMultipartFile("file", filename, MediaType.APPLICATION_OCTET_STREAM_VALUE, content))
				.header("X-XSRF-TOKEN", xsrf.getValue())
				.cookie(withXsrf(xsrf))
				.exchange();
	}

	private MvcTestResult send(MockMvcTester.MockMvcRequestBuilder request, String json) {
		Cookie xsrf = xsrf();
		MockMvcTester.MockMvcRequestBuilder prepared = request.header("X-XSRF-TOKEN", xsrf.getValue()).cookie(withXsrf(xsrf));
		if (!json.isEmpty()) {
			prepared = prepared.contentType(MediaType.APPLICATION_JSON).content(json);
		}
		return prepared.exchange();
	}

	private Cookie xsrf() {
		return mvc.get().uri("/api/auth/csrf").exchange().getResponse().getCookie("XSRF-TOKEN");
	}

	private Cookie[] withXsrf(Cookie xsrf) {
		List<Cookie> all = new ArrayList<>(cookies);
		all.add(xsrf);
		return all.toArray(Cookie[]::new);
	}
}
