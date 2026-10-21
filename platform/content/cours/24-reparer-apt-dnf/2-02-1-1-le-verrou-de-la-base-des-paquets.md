Sous Debian et ses dérivés, `apt` ne manipule pas lui-même les paquets : il délègue l'installation à `dpkg`,
l'outil de bas niveau. Avant toute modification, ces outils posent des **verrous** sur plusieurs fichiers, afin
que deux programmes ne puissent jamais écrire simultanément dans la base des paquets.

![apt upgrade (PID 2143) détient le verrou de la base des paquets /var/lib/dpkg/status ; un second apt install échoue avec « E: Could not get lock », tandis que dnf upgrade, sous RHEL, patiente (« Waiting for process… ») ; le noyau libère le verrou dès que le processus qui le détient se termine](images/figure-02.webp "Figure 2 — Un seul processus détient le verrou ; les autres échouent (apt) ou patientent (dnf).")

| Fichier de verrou | Posé par | Protège |
|:--|:--|:--|
| `/var/lib/dpkg/lock-frontend` | apt, dpkg | L'accès exclusif d'un seul outil frontal |
| `/var/lib/dpkg/lock` | dpkg | La base des paquets installés (`/var/lib/dpkg/status`) |
| `/var/lib/apt/lists/lock` | apt update | Les listes de paquets des dépôts |
| `/var/cache/apt/archives/lock` | apt | Le cache des paquets téléchargés (`.deb`) |

> [!NOTE] Le point clé
> Ces verrous sont gérés par le **noyau** : ils sont libérés automatiquement dès que le processus qui les détient
> se termine, même brutalement. Si l'erreur persiste après une reconnexion, c'est donc presque toujours qu'**un
> autre processus tourne encore** — le plus souvent le service de mises à jour automatiques.
