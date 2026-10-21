Un même caractère, deux mécanismes. L'**expansion de l'historique** agit à la lecture de la ligne,
avant toute exécution, et seulement en interactif. La **négation** fait partie du langage et fonctionne
partout.

![Deux colonnes : à gauche l'expansion de l'historique (interactif seulement : !!, !1551, !-2, !ls, !?txt?, !\$, !^, !*, !:2, ^a^b^, :h, :p, :gs/a/b/), à droite la négation logique (partout, scripts compris : ! commande, [ ! -d rep ], [[ ! … ]], !(motif), \${!var}, \${!tab[@]})](images/figure-01.webp "Figure 1 — Les deux visages du ! dans Bash.")

> [!TIP] Comment savoir lequel agit ?
> Si `!` est suivi d'un chiffre, d'un `!`, d'un `$`, d'un `^`, d'un `*`, d'un `-`, d'un `?` ou d'un mot,
> c'est l'**historique**. S'il est suivi d'une espace, d'un `=` ou d'une parenthèse (motif étendu), ou s'il
> se trouve dans `${…}`, c'est le **langage**.

## Anatomie d'une expansion d'historique

Une expansion d'historique se compose de trois parties, dont seule la première est obligatoire :

![Décomposition de !cp:2:h:p en un événement (!cp, la dernière commande qui commence par cp), un mot (:2, le deuxième argument) et deux modificateurs (:h garde le répertoire, :p affiche sans exécuter) ; appliquée à « cp /home/avi/Desktop/1.txt /home/avi/Downloads », elle affiche /home/avi](images/figure-02.webp "Figure 2 — Événement, mot, modificateurs : la grammaire de l'expansion d'historique.")

| Partie | Rôle | Exemples |
|:--|:--|:--|
| **Événement** | Quelle commande de l'historique | `!!` `!1551` `!-2` `!ls` `!?Desktop?` |
| **Mot** | Quelle partie de cette commande (après `:`) | `:0` `:2` `^` `$` `*` `:2-4` `:3*` |
| **Modificateurs** | Comment la transformer (chacun précédé de `:`) | `:h` `:t` `:r` `:e` `:p` `:gs/a/b/` |

> [!TIP] Lire de gauche à droite
> `!cp:2:h:p` se lit : « dans la dernière commande qui commence par `cp`, prends le deuxième argument,
> garde son répertoire, et affiche le résultat sans l'exécuter ».

## Les 15 usages du guide

| N° | Syntaxe | Rôle | Où ? | Niveau |
|:-:|:--|:--|:--|:--|
| 01 | `!1551` | Réexécuter une commande par son numéro | Interactif | 🟢 Essentiel |
| 02 | `!-2` | Rappeler une commande par sa position | Interactif | 🔵 Pratique |
| 03 | `!!` | Répéter la dernière commande (`sudo !!`) | Interactif | 🟢 Essentiel |
| 04 | `!ls` · `!?txt?` | Rappeler par le début ou le contenu | Interactif | 🔵 Pratique |
| 05 | `!$` · `!^` · `!*` | Réutiliser les arguments précédents | Interactif | 🟢 Essentiel |
| 06 | `!:2` · `!cp:2` | Choisir un argument ou une plage | Interactif | 🔵 Pratique |
| 07 | `^a^b^` | Corriger une faute de frappe | Interactif | 🟢 Essentiel |
| 08 | `:h` · `:t` · `:r` · `:e` | Découper un chemin de fichier | Interactif | 🟣 Avancé |
| 09 | `:p` | Prévisualiser avant d'exécuter | Interactif | 🟢 Essentiel |
| 10 | `set +H` | Éviter l'erreur « event not found » | Interactif | 🔵 Pratique |
| 11 | `histexpand` | Historique et scripts : ce qui marche | Scripts | 🔵 Pratique |
| 12 | `[ ! -d rep ]` | Tester l'absence d'un fichier | Partout | 🟢 Essentiel |
| 13 | `if ! cmd` | Inverser un code de retour | Partout | 🟢 Essentiel |
| 14 | `!(motif)` | Exclure des fichiers d'un motif | Partout | 🟣 Avancé |
| 15 | `${!var}` | Expansion indirecte, clés de tableau | Partout | 🟣 Avancé |

🟢 **Essentiel** : dès le premier jour · 🔵 **Pratique** : usage régulier · 🟣 **Avancé** : scripts et cas particuliers
