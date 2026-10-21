![Partie 02](images/p11-bandeau-partie.webp)

Un processus encore actif est la cause la plus fréquente d'une erreur de verrou. Avant toute réparation, on
**sécurise sa session** de travail, puis on **identifie précisément ce processus** — sans rien modifier.

![Erreur de verrou, ou dnf en attente : identifier le processus (fuser -v, ps -fp) ; s'il est actif, attendre sa fin (kill du PID seulement s'il est figé depuis longtemps) ; sinon, verrou orphelin, en dernier recours : supprimer les verrous puis dpkg --configure -a ; dans les deux cas, la réparation suit (parties 3 et 4)](images/p11-illustration-3.webp "Processus actif ou verrou orphelin ?")

| Étape | Commande | Rôle |
|:-:|:--|:--|
| 01 | `tmux` | Sécuriser la session SSH |
| 02 | `fuser -v` | Trouver qui détient le verrou dpkg |
| 03 | `rm` (verrous) | Supprimer un verrou orphelin, en dernier recours |
| 04 | `ps -fp` | Identifier le processus attendu par dnf |
