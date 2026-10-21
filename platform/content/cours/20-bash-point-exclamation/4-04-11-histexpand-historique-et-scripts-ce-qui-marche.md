| 🎯 Objectif | 🖥️ Contexte | 📶 Niveau |
|:--|:--|:--|
| Distinguer interactif et script | Scripts shell | 🔵 Pratique |

L'expansion d'historique est réservée aux **shells interactifs**. Dans un script, l'option `histexpand`
est désactivée et aucun historique n'est chargé : `!!`, `!$`, `!123`, `!chaîne` ou `^a^b^` y restent du
texte ordinaire.

```bash title="bash"
$ bash -c 'set -o | grep histexpand'
histexpand      off
$ echo $-                       # dans un terminal : la lettre H signale histexpand
himBHs
```

| Interactif seulement | Partout, scripts compris |
|:--|:--|
| `!!` `!$` `!^` `!*` | `! commande` : inverser un code de retour |
| `!123` `!-2` `!chaîne` `!?texte?` | `[ ! -d rep ]` et `[[ ! … ]]` |
| `^ancien^nouveau^` | `!(motif)` avec `shopt -s extglob` |
| `:h` `:t` `:r` `:e` `:p` `:gs/a/b/` | `${!var}` et `${!tableau[@]}` |

> [!TIP] Dans un script, des variables
> Remplacez les raccourcis d'historique par des variables : `fichier=/etc/nginx/nginx.conf`, puis
> `dirname "$fichier"` et `basename "$fichier"`, ou les expansions `${fichier%/*}` (répertoire) et
> `${fichier##*/}` (nom).
