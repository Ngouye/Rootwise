package sn.cryptoplatform.user;

import java.util.Collection;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/** Point d'entrée du module utilisateurs pour les autres modules. */
public interface UserService {

	Optional<UserAccount> findById(long userId);

	/** Recherche par e-mail (normalisé, insensible à la casse). */
	Optional<UserAccount> findByEmail(String email);

	/** Recherche par nom d'utilisateur, insensible à la casse. */
	Optional<UserAccount> findByUsername(String username);

	boolean isUsernameTaken(String username);

	/** Hash du mot de passe, vide pour un compte uniquement OAuth. */
	Optional<String> findPasswordHash(long userId);

	/** Crée un membre (rôle MEMBER, e-mail à vérifier) et publie {@link UserRegistered}. */
	UserAccount registerWithPassword(String email, String username, String displayName, String passwordHash);

	/** Crée un membre dont l'e-mail a été vérifié par un fournisseur OAuth ; le nom d'utilisateur est dérivé de l'indice. */
	UserAccount registerExternal(String email, String usernameHint, String displayName);

	UserAccount markEmailVerified(long userId);

	void changePasswordHash(long userId, String passwordHash);

	void removePassword(long userId);

	/** Révoque tous les JWT déjà émis pour ce compte. */
	void revokeTokens(long userId);

	/** Ajoute un rôle ; les JWT existants sont révoqués pour que le changement s'applique aussitôt. */
	void grantRole(long userId, Role role);

	/** Profils publics de plusieurs membres en une requête (auteurs d'une liste de cours, etc.). */
	Map<Long, PublicProfile> findPublicProfiles(Collection<Long> userIds);

	/** Profil public d'un membre actif, par son nom d'utilisateur. */
	Optional<PublicProfile> findPublicProfile(String username);

	/** Nom affiché, titre professionnel et présentation (vides : retirés). */
	PublicProfile updateProfile(long userId, String displayName, String headline, String bio);

	/** Remplace la photo de profil par une image déjà stockée, ou la retire (null). */
	PublicProfile changeAvatar(long userId, Long avatarMediaId);

	static String normalizeEmail(String email) {
		return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
	}
}
