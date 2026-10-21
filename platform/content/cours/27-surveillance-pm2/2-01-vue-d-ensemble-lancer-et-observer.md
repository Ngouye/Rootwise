![Partie 01](images/p08-bandeau-partie.webp)

Avant de surveiller, il faut une application **lancée par PM2, avec un nom clair**. Ces trois commandes la
démarrent, dressent l'inventaire des processus et ouvrent la fiche détaillée de chacun.

![Lancer et observer : le fichier ecosystem.config.js déclare l'application api (script ./app.js, 2 instances en mode cluster, max_memory_restart à 300M) ; pm2 ls montre les deux instances api online et worker en errored après 15 redémarrages ; ligne host metrics : cpu 3,8 %, ram 41 %](images/p08-illustration-3.webp "Lancer et observer")

| Fiche | Commande | Rôle |
|:-:|:--|:--|
| 01 | `pm2 start` | Lancer et nommer l'application |
| 02 | `pm2 list` | Lire l'état des processus |
| 03 | `pm2 show` | Inspecter un processus en détail |
