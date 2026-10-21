package sn.cryptoplatform.user;

/** Publié à la création d'un compte, quelle que soit la méthode d'inscription. */
public record UserRegistered(long userId, boolean emailVerified) {
}
