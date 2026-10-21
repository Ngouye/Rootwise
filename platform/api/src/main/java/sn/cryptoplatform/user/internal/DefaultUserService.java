package sn.cryptoplatform.user.internal;

import java.security.SecureRandom;
import java.util.Collection;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.cryptoplatform.user.PublicProfile;
import sn.cryptoplatform.user.Role;
import sn.cryptoplatform.user.UserAccount;
import sn.cryptoplatform.user.UserRegistered;
import sn.cryptoplatform.user.UserService;
import sn.cryptoplatform.user.UserStatus;

@Service
@Transactional(readOnly = true)
class DefaultUserService implements UserService {

	private static final SecureRandom RANDOM = new SecureRandom();

	private final UserRepository users;
	private final ApplicationEventPublisher events;
	private final Set<String> adminEmails;

	DefaultUserService(UserRepository users, ApplicationEventPublisher events, UserProperties properties) {
		this.users = users;
		this.events = events;
		this.adminEmails = properties.adminEmails().stream()
				.map(UserService::normalizeEmail)
				.filter(email -> !email.isEmpty())
				.collect(Collectors.toUnmodifiableSet());
	}

	@Override
	public Optional<UserAccount> findById(long userId) {
		return users.findById(userId).map(User::toAccount);
	}

	@Override
	public Optional<UserAccount> findByEmail(String email) {
		return users.findByEmail(UserService.normalizeEmail(email)).map(User::toAccount);
	}

	@Override
	public Optional<UserAccount> findByUsername(String username) {
		return users.findByUsernameIgnoreCase(username.trim()).map(User::toAccount);
	}

	@Override
	public boolean isUsernameTaken(String username) {
		return users.existsByUsernameIgnoreCase(username.trim());
	}

	@Override
	public Optional<String> findPasswordHash(long userId) {
		return users.findById(userId).map(User::getPasswordHash);
	}

	@Override
	@Transactional
	public UserAccount registerWithPassword(String email, String username, String displayName, String passwordHash) {
		User user = users.save(new User(UserService.normalizeEmail(email), username.trim(), displayName.trim(), passwordHash));
		events.publishEvent(new UserRegistered(user.getId(), false));
		return user.toAccount();
	}

	@Override
	@Transactional
	public UserAccount registerExternal(String email, String usernameHint, String displayName) {
		User user = new User(UserService.normalizeEmail(email), availableUsername(usernameHint), displayName.trim(), null);
		verify(user);
		users.save(user);
		events.publishEvent(new UserRegistered(user.getId(), true));
		return user.toAccount();
	}

	@Override
	@Transactional
	public UserAccount markEmailVerified(long userId) {
		User user = load(userId);
		verify(user);
		return user.toAccount();
	}

	@Override
	@Transactional
	public void changePasswordHash(long userId, String passwordHash) {
		load(userId).changePasswordHash(passwordHash);
	}

	@Override
	@Transactional
	public void removePassword(long userId) {
		load(userId).changePasswordHash(null);
	}

	@Override
	@Transactional
	public void revokeTokens(long userId) {
		load(userId).revokeTokens();
	}

	@Override
	@Transactional
	public void grantRole(long userId, Role role) {
		User user = load(userId);
		user.grant(role);
		user.revokeTokens();
	}

	@Override
	public Map<Long, PublicProfile> findPublicProfiles(Collection<Long> userIds) {
		return users.findAllById(userIds).stream().collect(Collectors.toMap(User::getId, User::toPublicProfile));
	}

	@Override
	public Optional<PublicProfile> findPublicProfile(String username) {
		return users.findByUsernameIgnoreCase(username.trim())
				.filter(user -> user.getStatus() == UserStatus.ACTIVE)
				.map(User::toPublicProfile);
	}

	@Override
	@Transactional
	public PublicProfile updateProfile(long userId, String displayName, String headline, String bio) {
		User user = load(userId);
		user.updateProfile(displayName.trim(), blankToNull(headline), blankToNull(bio));
		return user.toPublicProfile();
	}

	@Override
	@Transactional
	public PublicProfile changeAvatar(long userId, Long avatarMediaId) {
		User user = load(userId);
		user.changeAvatar(avatarMediaId);
		return user.toPublicProfile();
	}

	private static String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}

	private void verify(User user) {
		user.verifyEmail();
		if (adminEmails.contains(user.getEmail())) {
			user.grant(Role.ADMIN);
		}
	}

	private User load(long userId) {
		return users.findById(userId).orElseThrow(() -> new IllegalArgumentException("Utilisateur inconnu : " + userId));
	}

	/** Nom d'utilisateur valide et libre, dérivé d'un pseudo GitHub ou d'une adresse e-mail. */
	private String availableUsername(String hint) {
		String base = hint == null ? "" : hint.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9_.-]", "");
		if (base.length() < 3) {
			base = "membre";
		}
		base = base.substring(0, Math.min(base.length(), 25));
		String candidate = base;
		while (users.existsByUsernameIgnoreCase(candidate)) {
			candidate = base + "-" + (1000 + RANDOM.nextInt(9000));
		}
		return candidate;
	}
}
