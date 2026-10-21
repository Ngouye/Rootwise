![Partie 04](images/p21-bandeau-partie.webp)

Une application peut aller bien sur un serveur qui, lui, va mal : **disque plein, mémoire saturée, processus
zombies**. Le module `pm2-server-monit` ajoute ces signaux vitaux, à côté de ceux de vos applications.

![Les ressources du serveur relevées par pm2-server-monit : processeur à 38 %, mémoire à 61 %, disque libre à 68 % et 37 processus](images/p21-illustration-3.webp "Les ressources du serveur")

| Fiche | Commande | Rôle |
|:-:|:--|:--|
| 11 | `pm2 install` | Installer `pm2-server-monit` |
| 12 | `pm2 set` | Régler le module |
| 13 | `pm2 uninstall` | Retirer un module |
