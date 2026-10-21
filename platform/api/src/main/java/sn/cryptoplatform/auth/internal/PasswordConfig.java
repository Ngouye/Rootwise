package sn.cryptoplatform.auth.internal;

import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
class PasswordConfig {

	/**
	 * Argon2id avec les paramètres minimaux recommandés par l'OWASP (19 Mio, 2 itérations, 1 fil).
	 * Le préfixe {argon2} stocké avec chaque hash permet de changer d'algorithme plus tard :
	 * les anciens hashs sont recalculés à la connexion suivante.
	 */
	@Bean
	PasswordEncoder passwordEncoder() {
		return new DelegatingPasswordEncoder("argon2", Map.of(
				"argon2", new Argon2PasswordEncoder(16, 32, 1, 19 * 1024, 2),
				"bcrypt", new BCryptPasswordEncoder()));
	}
}
