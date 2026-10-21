package sn.cryptoplatform;

import java.time.Duration;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.awaitility.Awaitility;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;

/** Remplace le serveur SMTP : les e-mails sont conservés en mémoire pour les assertions. */
public class CapturingMailSender extends JavaMailSenderImpl {

	private final List<SimpleMailMessage> sent = new CopyOnWriteArrayList<>();

	@Override
	public void send(SimpleMailMessage... messages) {
		sent.addAll(List.of(messages));
	}

	public void clear() {
		sent.clear();
	}

	/** Attend l'e-mail envoyé (en asynchrone) à cette adresse et contenant ce texte. */
	public SimpleMailMessage awaitMessage(String to, String containing) {
		return Awaitility.await().atMost(Duration.ofSeconds(15)).until(() -> sent.stream()
				.filter(message -> List.of(Objects.requireNonNull(message.getTo())).contains(to))
				.filter(message -> Objects.requireNonNull(message.getText()).contains(containing))
				.reduce((first, second) -> second)
				.orElse(null), Objects::nonNull);
	}

	/** Jeton du lien {@code <page>#token=...} reçu par cette adresse. */
	public String awaitToken(String to, String page) {
		String text = awaitMessage(to, page + "#token=").getText();
		Matcher matcher = Pattern.compile(Pattern.quote(page) + "#token=([A-Za-z0-9_-]+)").matcher(text);
		if (!matcher.find()) {
			throw new AssertionError("Aucun jeton dans : " + text);
		}
		return matcher.group(1);
	}

	public long countSentTo(String to) {
		return sent.stream().filter(message -> List.of(Objects.requireNonNull(message.getTo())).contains(to)).count();
	}

	@TestConfiguration(proxyBeanMethods = false)
	public static class Config {

		@Bean
		CapturingMailSender mailSender() {
			return new CapturingMailSender();
		}
	}
}
