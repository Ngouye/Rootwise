![Partie 01](images/p07-bandeau-partie.webp)

`head` affiche le **début** d'un fichier — par défaut ses 10 premières lignes. C'est le moyen le plus
rapide de vérifier un format, un en-tête de colonnes ou les premières entrées d'un fichier, sans ouvrir
d'éditeur.

![Le fichier ventes.csv (12 480 lignes) : ses trois premières lignes, l'en-tête date,client,montant et deux ventes, sont surlignées et reproduites dans un terminal par head -n 3 ventes.csv ; en dessous, les variantes head -n 5, head -n -1 et head -c 1K](images/p07-illustration-3.webp "Vérifier un format, un en-tête, les premières entrées")

| Fiche | Syntaxe | Rôle |
|:-:|:--|:--|
| 01 | `head` | Afficher les 10 premières lignes |
| 02 | `head -n` | Choisir le nombre de lignes |
| 03 | `head f1 f2` | Plusieurs fichiers à la fois |
| 04 | `head -c` | Compter en octets |
| 05 | `head -n -N` | Tout sauf les N dernières lignes |
