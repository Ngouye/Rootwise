![Partie 02](images/p12-bandeau-partie.webp)

Commentaire, répertoire personnel, nom de connexion et shell : ces attributs vivent dans `/etc/passwd`.
Certains sont anodins, d'autres — renommer un compte ou déplacer son répertoire — demandent une vraie
préparation.

![Anatomie d'une ligne de /etc/passwd : alice (identifiant, -l) : x (mot de passe) : 1001 (UID, -u) : 1001 (GID principal, -g) : Alice Martin,DevOps (commentaire GECOS, -c) : /home/alice (répertoire, -d / -m) : /bin/bash (shell, -s)](images/p12-illustration-3.webp "Chaque champ de /etc/passwd correspond à une option de usermod")

| Fiche | Syntaxe | Rôle |
|:-:|:--|:--|
| 01 | `usermod -c` | Mettre à jour le commentaire GECOS |
| 02 | `usermod -d` | Changer seulement le chemin du répertoire |
| 03 | `usermod -d -m` | Déplacer le répertoire et son contenu |
| 04 | `usermod -l` | Renommer un compte |
| 05 | `usermod -s` | Changer le shell de connexion |
