Ces annexes rassemblent les informations à garder sous la main : aide-mémoire, référence complète de
l'expansion d'historique, réglages utiles, le `!` ailleurs dans Linux, messages d'erreur et glossaire.

## A. Aide-mémoire : « Je veux… »

| Je veux… | Commande |
|:--|:--|
| Relancer la dernière commande avec sudo | `sudo !!` |
| Relancer la commande n° 1551 | `!1551` |
| Relancer l'avant-dernière commande | `!-2` |
| Relancer la dernière commande ssh | `!ssh` |
| Réutiliser le dernier argument | `!$` (ou **Alt+.**) |
| Réutiliser tous les arguments | `!*` |
| Corriger une faute de frappe | `^ngnix^nginx^` |
| Remplacer partout dans la commande | `!!:gs/ancien/nouveau/` |
| Aller dans le répertoire du fichier | `cd !$:h` |
| Voir sans exécuter | `!rm:p` |
| Écrire un `!` littéral | `'texte!'` ou `set +H` |
| Tout supprimer sauf les PDF | `shopt -s extglob; rm !(*.pdf)` |

## B. Référence de l'expansion d'historique

| Type | Forme | Signification |
|:--|:--|:--|
| Événement | `!!` | La commande précédente (comme `!-1`) |
| Événement | `!n` · `!-n` | La commande numéro *n* · *n* commandes en arrière |
| Événement | `!chaîne` · `!?chaîne?` | La dernière commande qui commence par · contient *chaîne* |
| Événement | `!#` | La ligne en cours de saisie, jusqu'ici |
| Raccourci | `^a^b^` | La commande précédente, *a* remplacé par *b* |
| Mot | `0` · `n` · `^` · `$` | Commande · argument *n* · premier · dernier |
| Mot | `x-y` · `x*` · `x-` | De *x* à *y* · de *x* à la fin · de *x* à l'avant-dernier |
| Mot | `*` | Tous les arguments (comme `1*`) |
| Modificateur | `:h` · `:t` | Répertoire · nom (`dirname` · `basename`) |
| Modificateur | `:r` · `:e` | Sans extension · extension seule |
| Modificateur | `:p` | Afficher sans exécuter |
| Modificateur | `:s/a/b/` · `:gs/a/b/` | Remplacer la première · toutes les occurrences |
| Modificateur | `:q` | Mettre le résultat entre guillemets simples |

## C. Réglages utiles de l'historique

```bash title="~/.bashrc"
HISTSIZE=10000                  # commandes gardées en mémoire
HISTFILESIZE=20000              # lignes conservées dans ~/.bash_history
HISTCONTROL=ignoreboth          # ni doublons, ni commandes précédées d'une espace
HISTTIMEFORMAT='%F %T '         # horodatage dans la sortie de history
shopt -s histappend             # ajouter au fichier au lieu de l'écraser
shopt -s histverify             # relire avant d'exécuter
```

## D. Le `!` ailleurs dans Linux

| Syntaxe | Rôle |
|:--|:--|
| `#!/bin/bash` | Shebang : l'interpréteur qui exécute le script |
| `[ "$a" != "$b" ]` | Comparaison « différent de » |
| `find . ! -name '*.log'` | Négation d'un critère de `find` |
| `awk '!vu[$0]++' fichier` | Supprimer les doublons en gardant l'ordre |
| `:w !sudo tee %` | Vim : enregistrer un fichier protégé |
| `ip route \| grep -v default` | « Tout sauf » avec `grep`… sans aucun `!` |

## E. Messages d'erreur courants

| Message | Cause et solution |
|:--|:--|
| `bash: !Pass: event not found` | Un `!` entre guillemets doubles : guillemets simples ou `set +H` |
| `bash: !zzz: event not found` | Aucune commande de l'historique ne correspond |
| `bash: :3*: bad word specifier` | La commande précédente a moins d'arguments que demandé |
| `bash: 1551: command not found` | Une espace entre `!` et le numéro : écrire `!1551` |
| `chmod: invalid option -- 'p'` | `!*` a repris une option : utiliser `!:2*` |
| `syntax error near unexpected token` | Motif `!(…)` sans `extglob` : `shopt -s extglob` |

## F. Glossaire

| Terme | Définition |
|:--|:--|
| Expansion d'historique | Remplacement d'une référence (`!!`, `!$`…) par du texte de l'historique, avant l'exécution |
| Événement | Une commande de l'historique, désignée par numéro, position ou texte |
| Désignateur de mot | Sélection d'un ou plusieurs mots d'un événement (`:2`, `$`, `*`) |
| Modificateur | Transformation appliquée au résultat (`:h`, `:t`, `:p`, `:gs`…) |
| `histexpand` | Option qui active l'expansion d'historique (`set -H` / `set +H`) |
| `histverify` | Option qui place la commande développée sur la ligne au lieu de l'exécuter |
| `extglob` | Option des motifs étendus : `!(…)`, `?(…)`, `*(…)`, `+(…)`, `@(…)` |
| Code de retour | Nombre renvoyé par une commande : 0 = succès, autre = échec |
| Expansion indirecte | `${!nom}` : la valeur de *nom* sert de nom de variable |
| Shell interactif | Shell qui lit les commandes au clavier, avec historique et invite |

## G. Sources et références

- Avishek, « 15 exemples d'opérateurs Bash (!) que tout utilisateur Linux devrait connaître », *Tecmint*
  (tecmint.com), mis à jour le 4 août 2026. Article dont ce guide reprend les exemples, qu'il corrige et enrichit.
- *GNU Bash Reference Manual* : « History Interaction », « Pattern Matching », « Shell Parameter Expansion » ;
  page de manuel `bash(1)`, section HISTORY EXPANSION.
- Exemples vérifiés avec GNU Bash 5.2.

*Document rédigé et mis en forme par **Ngouye GNING** — version 1.0, octobre 2026.*
