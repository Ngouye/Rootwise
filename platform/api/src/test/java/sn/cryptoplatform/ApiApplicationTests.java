package sn.cryptoplatform;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import static org.assertj.core.api.Assertions.assertThat;

@IntegrationTest
class ApiApplicationTests {

	@Autowired
	MockMvcTester mvc;

	@Autowired
	JdbcTemplate jdbc;

	@Test
	void migrationsCreateSchemaAndReferenceData() {
		Integer channels = jdbc.queryForObject("SELECT count(*) FROM conversations WHERE type = 'CHANNEL'", Integer.class);
		Integer categories = jdbc.queryForObject("SELECT count(*) FROM forum_categories", Integer.class);

		assertThat(channels).isEqualTo(4);
		assertThat(categories).isEqualTo(4);
	}

	@Test
	void healthEndpointIsPublic() {
		assertThat(mvc.get().uri("/actuator/health")).hasStatusOk();
	}

	@Test
	void everythingElseRequiresAuthentication() {
		assertThat(mvc.get().uri("/api/courses")).hasStatus(HttpStatus.UNAUTHORIZED);
		assertThat(mvc.get().uri("/api/auth/me")).hasStatus(HttpStatus.UNAUTHORIZED);
		assertThat(mvc.get().uri("/actuator/prometheus")).hasStatus(HttpStatus.UNAUTHORIZED);
	}

}
