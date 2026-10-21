![Partie 01](images/p07-bandeau-partie.webp)

`usermod` n'a **ni mode simulation ni fonction d'annulation**. Avant de toucher à un compte réel, il faut
savoir ce que la commande va modifier, vérifier quatre points et sauvegarder les bases de comptes.

![Quatre vérifications et une sauvegarde : 1. privilèges root (sudo), 2. compte existant (getent passwd), 3. aucune session (pgrep -u), 4. compte local (pas LDAP ni SSSD) ; puis sauvegarde avant toute modification : sudo cp -a /etc/passwd /etc/shadow /etc/group /etc/gshadow /root/user-backup/](images/p07-illustration-3.webp "Quatre vérifications et une sauvegarde")

| Étape | Sujet | Rôle |
|:-:|:--|:--|
| 1.1 | Fichiers modifiés | Ce que `usermod` change sur le disque |
| 1.2 | Vérifications | Les quatre contrôles préalables |
| 1.3 | Sauvegarde | Protéger passwd, shadow, group et gshadow |
| 1.4 | `-G` ou `-aG` | Remplacer ou ajouter : vérifier avant et après |
