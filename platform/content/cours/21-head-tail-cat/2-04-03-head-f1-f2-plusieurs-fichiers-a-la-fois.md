| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Comparer le début de plusieurs fichiers | Toutes distributions (GNU coreutils) | 🔵 Pratique |

`head` accepte plusieurs fichiers : chaque extrait est alors précédé d'un en-tête `==> nom <==` qui
indique sa provenance.

```bash title="bash"
$ head -n 3 /etc/passwd /etc/group
==> /etc/passwd <==
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin

==> /etc/group <==
root:x:0:
daemon:x:1:
bin:x:2:
```

| Option | Effet |
|:--|:--|
| `-q` | Ne jamais afficher les en-têtes (`--quiet`) |
| `-v` | Toujours afficher l'en-tête, même pour un seul fichier (`--verbose`) |

> [!TIP] Cas pratique
> `head -n 1 *.csv` affiche d'un coup la ligne d'en-tête de tous les fichiers CSV d'un dossier : idéal
> pour vérifier que leurs colonnes concordent avant de les assembler.
