![Partie 04](images/p24-bandeau-partie.webp)

La vraie puissance de ces outils apparaît lorsqu'on **les combine** entre eux et avec `sed`, `grep` ou
`less`. Voici les combinaisons les plus utiles au quotidien.

![Deux recettes : extraire une plage, nginx.conf passe par head -n 30 puis tail -n 11 pour obtenir les lignes 20 à 30 (ou directement sed -n '20,30p' nginx.conf) ; lire à l'envers, tac transforme Janvier, Février, Mars, Avril en Avril, Mars, Février, Janvier ; en dessous, tail -F | grep, less +F, tail -n +2 | wc -l et tac | head](images/p24-illustration-3.webp "Extraire une plage, lire à l'envers")

| Fiche | Syntaxe | Rôle |
|:-:|:--|:--|
| 19 | `tac` | Lire un fichier à l'envers |
| 20 | `head \| tail` | Extraire une plage de lignes |
| 21 | Recettes | Les combinaisons du quotidien |
