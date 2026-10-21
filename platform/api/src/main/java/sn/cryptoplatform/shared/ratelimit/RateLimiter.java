package sn.cryptoplatform.shared.ratelimit;

import java.time.Duration;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Supplier;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import sn.cryptoplatform.shared.web.ApiException;

/**
 * Compteurs à fenêtre fixe dans PostgreSQL (table {@code rate_limit_counters}), partagés par
 * toutes les instances de l'API. Les clés ne doivent pas contenir de donnée personnelle en clair
 * (hacher les e-mails).
 *
 * <p>Chaque opération s'exécute <strong>hors de la transaction de l'appelant</strong> : un échec de
 * connexion annule la transaction en cours, mais le compteur d'échecs, lui, doit rester compté.
 */
@Component
public class RateLimiter {

	/** Une incrémentation sur cent purge aussi les compteurs expirés depuis plus d'une heure. */
	private static final int CLEANUP_ONE_IN = 100;

	private final JdbcClient jdbc;
	private final TransactionTemplate outsideCallerTransaction;

	RateLimiter(JdbcTemplate jdbcTemplate, PlatformTransactionManager transactions) {
		this.jdbc = JdbcClient.create(jdbcTemplate);
		this.outsideCallerTransaction = new TransactionTemplate(transactions);
		this.outsideCallerTransaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_NOT_SUPPORTED);
	}

	/** Compte une tentative et refuse (429) au-delà de {@code limit} dans la fenêtre. */
	public void hit(String key, int limit, Duration window) {
		if (increment(key, window) > limit) {
			throw tooManyRequests(key);
		}
	}

	/** Refuse (429) si le compteur a déjà atteint {@code limit}, sans le modifier. */
	public void check(String key, int limit) {
		Optional<Long> hits = outside(() -> jdbc
				.sql("SELECT hits FROM rate_limit_counters WHERE counter_key = ? AND expires_at > now()")
				.param(key)
				.query(Long.class)
				.optional());
		if (hits.isPresent() && hits.get() >= limit) {
			throw tooManyRequests(key);
		}
	}

	/** Ajoute une tentative ; la fenêtre démarre à la première tentative et repart après expiration. */
	public long increment(String key, Duration window) {
		return outside(() -> {
			if (ThreadLocalRandom.current().nextInt(CLEANUP_ONE_IN) == 0) {
				jdbc.sql("DELETE FROM rate_limit_counters WHERE expires_at < now() - interval '1 hour'").update();
			}
			return jdbc.sql("""
					INSERT INTO rate_limit_counters (counter_key, hits, expires_at)
					VALUES (:key, 1, now() + make_interval(secs => :seconds))
					ON CONFLICT (counter_key) DO UPDATE SET
					  hits = CASE WHEN rate_limit_counters.expires_at <= now() THEN 1
					              ELSE rate_limit_counters.hits + 1 END,
					  expires_at = CASE WHEN rate_limit_counters.expires_at <= now() THEN EXCLUDED.expires_at
					                    ELSE rate_limit_counters.expires_at END
					RETURNING hits""")
					.param("key", key)
					.param("seconds", window.toMillis() / 1000.0)
					.query(Long.class)
					.single();
		});
	}

	public void reset(String key) {
		outside(() -> jdbc.sql("DELETE FROM rate_limit_counters WHERE counter_key = ?").param(key).update());
	}

	private ApiException tooManyRequests(String key) {
		Duration retryAfter = outside(() -> jdbc
				.sql("SELECT ceil(extract(epoch FROM expires_at - now()))::bigint FROM rate_limit_counters WHERE counter_key = ?")
				.param(key)
				.query(Long.class)
				.optional())
				.filter(seconds -> seconds >= 1)
				.map(Duration::ofSeconds)
				.orElse(Duration.ofSeconds(60));
		long minutes = Math.max(1, (retryAfter.toSeconds() + 59) / 60);
		return new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED",
				"Trop de tentatives. Réessayez dans " + minutes + " minute" + (minutes > 1 ? "s" : "") + ".",
				retryAfter);
	}

	/** Suspend la transaction de l'appelant : chaque requête est validée immédiatement. */
	private <T> T outside(Supplier<T> work) {
		return outsideCallerTransaction.execute(status -> work.get());
	}
}
