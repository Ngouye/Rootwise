![Partie 02](images/p14-bandeau-partie.webp)

Avant d'installer quoi que ce soit, il faut trouver le bon paquet : par mot-clé, par fichier fourni ou par
état. Ces commandes **ne modifient rien** et ne demandent aucun privilège.

![NEVRA, l'identité complète d'un paquet : nginx (nom) - 1 (époque) : 1.20.1 (version) - 22.el9 (release) . x86_64 (architecture) ; quatre commandes pour chercher : dnf search par mot-clé, dnf info fiche détaillée, dnf list par état, dnf provides par fichier](images/p14-illustration-3.webp "NEVRA : l'identité complète d'un paquet")

| Fiche | Commande | Rôle |
|:-:|:--|:--|
| 06 | `dnf search` | Rechercher un paquet par mot-clé |
| 07 | `dnf info` | Afficher le détail d'un paquet |
| 08 | `dnf list` | Lister les paquets selon leur état |
| 09 | `dnf provides` | Trouver le paquet qui fournit un fichier |
