![Partie 01](images/p09-bandeau-partie.webp)

Le premier réflexe face à un serveur lent : savoir **quels processus consomment** le processeur et la mémoire,
et si le système **attend quelque chose** — le disque, le swap ou l'hyperviseur.

![Qui consomme le processeur et la mémoire ? Courbes du CPU (38 %), de la mémoire (61 %) et de la charge sur 1 minute (0,84), à côté des cinq outils : top toujours disponible, htop interactif et coloré, atop historique et saturation, btop graphiques modernes, vmstat swap et file d'attente](images/p09-illustration-3.webp "Qui consomme le processeur et la mémoire ?")

| Fiche | Outil | Rôle |
|:-:|:--|:--|
| 01 | `top` | Le moniteur de processus de référence |
| 02 | `htop` | Une version interactive et colorée |
| 03 | `atop` | Toutes les ressources, avec historique |
| 04 | `btop` | Le moniteur moderne et graphique |
| 05 | `vmstat` | Mémoire virtuelle, swap et CPU |
