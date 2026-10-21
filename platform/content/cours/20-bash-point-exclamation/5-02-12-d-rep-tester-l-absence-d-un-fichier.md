| 🎯 Objectif | 🖥️ Contexte | 📶 Niveau |
|:--|:--|:--|
| Agir seulement si quelque chose manque | Terminal et scripts | 🟢 Essentiel |

Dans un test, `!` inverse le résultat : `[ -d rep ]` est vrai si le répertoire existe, `[ ! -d rep ]` s'il
n'existe pas.

```bash title="verifier.sh"
#!/bin/bash
if [ ! -d /srv/backups ]; then
    echo "Répertoire de sauvegarde absent : arrêt." >&2
    exit 1
fi
```

```bash title="bash"
$ [ ! -d /srv/backups ] && echo "absent" || echo "présent"
présent
```

| Test | Vrai si… (et avec `!` : si ce n'est pas le cas) |
|:--|:--|
| `-d chemin` | le chemin est un répertoire |
| `-f chemin` | le chemin est un fichier ordinaire |
| `-e chemin` | le chemin existe, quel que soit son type |
| `-x chemin` | le fichier est exécutable |
| `-s chemin` | le fichier existe et n'est pas vide |
| `-z "$v"` | la chaîne est vide |

> [!WARNING] Le piège de `A && B || C`
> Ce n'est pas un vrai « si… sinon » : si `B` échoue, `C` s'exécute aussi. Pour des actions importantes,
> écrivez un `if … then … else … fi`. Et pour créer un répertoire, `mkdir -p` suffit : il ne fait rien si
> le répertoire existe déjà.
