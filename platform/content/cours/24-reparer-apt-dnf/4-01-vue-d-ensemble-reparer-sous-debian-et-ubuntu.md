![Partie 03](images/p16-bandeau-partie.webp)

Une fois le verrou libéré, il reste à **terminer** l'installation des paquets restés en suspens, à **réparer**
les dépendances, puis à **vérifier** la cohérence de la base avant de **reprendre** la mise à jour.

![Debian/Ubuntu en quatre étapes : 5. terminer (dpkg --configure -a), 6. réparer (apt install -f), 7. vérifier (dpkg --audit), 8. reprendre (apt update && apt upgrade) ; les paquets passent de iU unpacked et iF half-configured à ii installed](images/p16-illustration-3.webp "Debian / Ubuntu — quatre étapes")

| Étape | Commande | Rôle |
|:-:|:--|:--|
| 05 | `dpkg --configure -a` | Terminer les configurations interrompues |
| 06 | `apt install -f` | Réparer les dépendances |
| 07 | `dpkg --audit` | Vérifier la cohérence de la base |
| 08 | `apt update && apt upgrade` | Reprendre la mise à jour |
