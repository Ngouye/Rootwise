![Partie 01](images/p07-bandeau-partie.webp)

Avant de réparer, il faut comprendre ce que faisait le gestionnaire de paquets au moment de l'interruption :
chaque commande de réparation vient **compléter ou annuler une partie précise** de ce travail inachevé.

![Coupure SSH pendant une mise à jour : sous Debian/Ubuntu (dpkg décompresse, puis configure), téléchargement et décompression sont faits mais pas la configuration, d'où des paquets iU et iF ; sous RHEL/Rocky/Alma (RPM installe la nouvelle version, puis retire l'ancienne), la nouvelle version est installée mais l'ancienne n'est pas retirée, d'où deux versions](images/p07-illustration-3.webp "Ce qu'une coupure laisse derrière elle")

| Étape | Sujet | Rôle |
|:-:|:--|:--|
| 1.1 | Le verrou | Pourquoi un seul programme à la fois |
| 1.2 | États de dpkg | Paquets décompressés mais non configurés |
| 1.3 | Doublons RPM | Deux versions enregistrées pour un même paquet |
