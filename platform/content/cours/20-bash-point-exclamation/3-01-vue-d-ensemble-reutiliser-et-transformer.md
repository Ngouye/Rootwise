![Partie 02](images/p13-bandeau-partie.webp)

Les arguments des commandes précédentes — chemins longs, listes de fichiers — sont réutilisables à la
demande : **en entier**, **un par un**, ou **transformés**. Et une faute de frappe se corrige en une ligne.

![Dans « \$ vim /srv/www/site/config.yml », !:0 désigne vim et !\$ le chemin ; :h donne /srv/www/site, :t config.yml, :r /srv/www/site/config et :e .yml](images/p13-illustration-3.webp "Réutiliser et transformer les arguments")

| Fiche | Syntaxe | Rôle |
|:-:|:--|:--|
| 05 | `!$` · `!^` · `!*` | Réutiliser les arguments précédents |
| 06 | `!:n` | Choisir un argument ou une plage |
| 07 | `^ancien^nouveau^` | Corriger une faute de frappe |
| 08 | `:h` · `:t` · `:r` · `:e` | Découper un chemin de fichier |
