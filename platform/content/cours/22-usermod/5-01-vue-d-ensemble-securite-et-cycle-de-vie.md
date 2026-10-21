![Partie 04](images/p21-bandeau-partie.webp)

Expiration, inactivité, verrouillage et mot de passe : ces réglages vivent dans `/etc/shadow`. Bien utilisés,
ils évitent les **comptes oubliés** et les accès qui survivent au départ d'un prestataire.

![Anatomie d'une ligne de /etc/shadow : identifiant alice, hachage du mot de passe (modifié par -p, -L et -U), dernier changement 20689, minimum 0, maximum 90, alerte 7, inactivité 7 (-f) et expiration 20818 (-e) ; les dates sont comptées en jours depuis le 1er janvier 1970, 20818 correspondant au 31 décembre 2026](images/p21-illustration-3.webp "Les dates sont comptées en jours depuis le 1er janvier 1970")

| Fiche | Syntaxe | Rôle |
|:-:|:--|:--|
| 09 | `usermod -e` | Fixer la date d'expiration du compte |
| 10 | `usermod -f` | Délai d'inactivité après expiration du mot de passe |
| 11 | `usermod -L` / `-U` | Verrouiller et déverrouiller |
| 12 | `usermod -p` | Définir un mot de passe correctement |
