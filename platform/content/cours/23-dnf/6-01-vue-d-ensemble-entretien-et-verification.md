![Partie 05](images/p29-bandeau-partie.webp)

Un système sain s'entretient : supprimer les dépendances devenues inutiles, garder un cache propre et vérifier
régulièrement la cohérence de la base RPM et des fichiers installés.

![Quatre gestes d'entretien : orphelins (dnf autoremove), cache (dnf clean all), métadonnées (dnf makecache), cohérence (dnf check) ; routine d'entretien mensuelle : sudo dnf upgrade --refresh && sudo dnf autoremove && dnf check](images/p29-illustration-3.webp "Quatre gestes d'entretien")

| Fiche | Commande | Rôle |
|:-:|:--|:--|
| 18 | `dnf autoremove` | Supprimer les dépendances orphelines |
| 19 | `dnf clean` | Vider et reconstruire le cache |
| 20 | `dnf check` | Vérifier la cohérence de la base RPM |
