package sn.cryptoplatform;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;

/**
 * Test d'intégration contre un PostgreSQL réel (Testcontainers), e-mails capturés.
 * Toutes les classes de test partagent la même configuration, donc un seul contexte Spring.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest
@AutoConfigureMockMvc
@Import({ TestcontainersConfiguration.class, CapturingMailSender.Config.class })
@TestPropertySource(properties = {
		"app.auth.oauth.github.client-id=test-github-client",
		"app.auth.oauth.github.client-secret=test-github-secret",
		"app.storage.type=memory" })
public @interface IntegrationTest {
}
