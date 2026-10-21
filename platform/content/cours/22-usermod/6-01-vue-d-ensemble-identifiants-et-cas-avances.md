![Partie 05](images/p26-bandeau-partie.webp)

Changer un UID, préparer un compte pour les conteneurs sans root, l'associer à un utilisateur SELinux ou
modifier un système hors ligne : des opérations **puissantes**, à réserver aux situations qui les justifient.

![Trois cas avancés : changer l'UID de bob de 1002 à 1500 (usermod -u 1500 bob, puis find -uid 1002 … chown) ; ID subordonnés, la plage 200000–265535 de l'hôte correspond à 0–65535 dans le conteneur, soit 65 536 identifiants pour alice (--add-subuids 200000-265535, Podman ou Docker sans root) ; SELinux, bob associé à l'utilisateur staff_u (usermod -Z staff_u bob, RHEL, Rocky, AlmaLinux, Fedora)](images/p26-illustration-3.webp "UID, identifiants subordonnés et SELinux")

| Fiche | Syntaxe | Rôle |
|:-:|:--|:--|
| 13 | `usermod -u` | Changer l'UID et corriger les fichiers |
| 14 | `--add-subuids` | Plages d'ID pour les conteneurs sans root |
| 15 | `usermod -Z` | Associer un utilisateur SELinux |
| 16 | Modifications combinées | Plusieurs attributs en une commande |
