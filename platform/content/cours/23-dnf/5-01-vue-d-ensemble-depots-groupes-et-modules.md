![Partie 04](images/p24-bandeau-partie.webp)

Les **dépôts** déterminent quels logiciels sont disponibles ; les **groupes** installent un ensemble cohérent de
paquets en une commande ; les **modules** permettent de choisir la version d'une application sur RHEL 8 et 9.

![Trois façons d'organiser les logiciels : les dépôts (baseos, appstream et epel activés, crb désactivé : dnf repolist --all), les groupes (« Development Tools » réunit gcc, make, git, autoconf, automake, gdb et patch : dnf group install) et les modules (nodejs, flux 18, 20 activé et 22, profils common, development, minimal et s2i : dnf module enable nodejs:20)](images/p24-illustration-3.webp "Trois façons d'organiser les logiciels")

| Fiche | Commande | Rôle |
|:-:|:--|:--|
| 14 | `dnf repolist` | Lister et activer des dépôts |
| 15 | `dnf config-manager` | Ajouter et configurer des dépôts |
| 16 | `dnf group` | Installer un ensemble de paquets |
| 17 | `dnf module` | Choisir la version d'une application |
