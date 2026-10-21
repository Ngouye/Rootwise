| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Lire un fichier court en entier | Toutes distributions (GNU coreutils) | 🟢 Essentiel |

Syntaxe : `cat [options] [fichier…]`. Le cas le plus simple : afficher un fichier court dans le terminal,
par exemple pour identifier la distribution installée.

```bash title="bash"
$ cat /etc/os-release
PRETTY_NAME="Ubuntu 24.04.3 LTS"
NAME="Ubuntu"
VERSION_ID="24.04"
VERSION="24.04.3 LTS (Noble Numbat)"
VERSION_CODENAME=noble
ID=ubuntu
ID_LIKE=debian
HOME_URL="https://www.ubuntu.com/"
UBUNTU_CODENAME=noble
# Plusieurs fichiers sont affichés l'un après l'autre, sans séparation
$ cat /etc/hostname /etc/hosts
```

> [!WARNING] Fichiers longs ou binaires
> Pour un fichier de plusieurs centaines de lignes, préférez `less`, qui permet de défiler et de rechercher.
> Et n'affichez jamais un fichier binaire avec `cat` : il peut dérégler le terminal (la commande `reset` le
> rétablit).
