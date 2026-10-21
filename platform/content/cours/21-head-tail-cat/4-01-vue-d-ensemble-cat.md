![Partie 03](images/p17-bandeau-partie.webp)

`cat` (pour *concatenate*) lit un ou plusieurs fichiers et écrit leur contenu sur la sortie standard.
Associé aux redirections, il sert aussi à **créer, compléter et assembler** des fichiers — et ses options
révèlent ce qu'un éditeur ne montre pas.

![Les fichiers 1.txt, 2.txt et 3.txt convergent vers cat, qui produit rapport.txt (Partie 1, Partie 2, Partie 3) ; à droite, cat -A révèle l'invisible d'un script : #!/bin/bash^M\$, echo "OK"^M\$, ^Icp a b\$ ; en dessous, les variantes cat f1 f2 > f3, cat >> f, << 'EOF' et cat -n](images/p17-illustration-3.webp "Révéler l'invisible")

| Fiche | Syntaxe | Rôle |
|:-:|:--|:--|
| 13 | `cat` | Afficher un fichier |
| 14 | `cat f1 f2 > f3` | Assembler des fichiers |
| 15 | `cat >` · heredoc | Créer et compléter un fichier |
| 16 | `cat -n` · `-b` | Numéroter les lignes |
| 17 | `cat -A` | Révéler les caractères invisibles |
| 18 | `cat \| …` | Alimenter un pipeline |
