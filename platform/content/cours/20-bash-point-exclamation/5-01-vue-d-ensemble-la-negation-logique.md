![Partie 04](images/p22-bandeau-partie.webp)

Dans les tests, les commandes, les motifs de fichiers et les variables, `!` change de nature : il
**inverse**, il **exclut**, il **désigne**. Cette fois, tout fonctionne aussi dans les scripts.

![Quatre formes : [ ! -d rep ] si absent, if ! cmd si échec, !(motif) tout sauf, \${!var} indirection ; exemple de script : if ! command -v jq >/dev/null 2>&1; then echo "jq est requis" >&2; exit 1; fi](images/p22-illustration-3.webp "La négation logique fonctionne dans les scripts")

| Fiche | Syntaxe | Rôle |
|:-:|:--|:--|
| 12 | `[ ! -d rep ]` | Tester l'absence d'un fichier |
| 13 | `if ! commande` | Inverser un code de retour |
| 14 | `!(motif)` | Exclure des fichiers d'un motif |
| 15 | `${!var}` | Expansion indirecte et clés de tableau |
