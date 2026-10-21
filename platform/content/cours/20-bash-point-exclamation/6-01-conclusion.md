![Illustration 3D : un point d'exclamation lumineux entouré d'anneaux, devant des fenêtres de terminal](images/p27-illustration-2.webp "Illustration 3D · le point d'exclamation de Bash")

Le point d'exclamation de Bash mène une **double vie** : raccourci d'historique dans le terminal,
opérateur de négation dans le langage. Savoir lequel des deux est à l'œuvre, c'est éviter la plupart des
surprises — et gagner un temps considérable.

![Le cycle sûr en quatre étapes : rappeler (!!, !ls, !\$), prévisualiser (:p, histverify), corriger (^a^b^, :gs/a/b/), puis exécuter avec Entrée](images/figure-08.webp "Figure 8 — Le cycle sûr d'une commande rappelée de l'historique.")

## Les réflexes à retenir

- `sudo !!` pour une erreur de droits — pas pour une commande introuvable ;
- `!$` et **Alt+.** pour les chemins ; `!:2*` plutôt que `!*` quand la commande a des options ;
- `:p` ou `histverify` avant tout `!rm` ou commande destructrice ;
- guillemets simples pour tout texte qui contient un `!` ;
- pas d'expansion d'historique dans un script : des variables à la place ;
- `ls !(motif)` avant `rm !(motif)`.

> [!TIP] Pour aller plus loin
> `fc` ouvre la dernière commande dans votre éditeur ; `history -d N` supprime une entrée ; la variable
> `HISTCONTROL=ignoreboth` évite d'enregistrer les doublons et les commandes précédées d'une espace.
