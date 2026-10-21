![Partie 03](images/p16-bandeau-partie.webp)

Dès que plusieurs serveurs entrent en jeu, ou qu'il faut garder un historique et recevoir des alertes, le
**tableau de bord web** prend le relais. Quatre étapes : créer un compte, relier le serveur, lire le tableau de bord
et détacher proprement.

![Le tableau de bord web PM2 Plus : les serveurs app01, app02 et worker01, reliés par pm2 link, alimentent le bucket PROD-APIs, consulté sur app.pm2.io (CPU 38 %, mémoire 61 %, 3 issues)](images/p16-illustration-3.webp "Le tableau de bord web PM2 Plus")

| Fiche | Étape | Rôle |
|:-:|:--|:--|
| 07 | app.pm2.io | Créer un compte et un bucket |
| 08 | `pm2 link` | Relier le serveur à PM2 Plus |
| 09 | Tableau de bord | Lire le tableau de bord web |
| 10 | `pm2 unlink` | Détacher un serveur |
