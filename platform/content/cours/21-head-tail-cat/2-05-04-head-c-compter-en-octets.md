| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Lire les premiers octets d'un fichier | Toutes distributions (GNU coreutils) | 🔵 Pratique |

Avec `-c`, `head` compte en **octets** plutôt qu'en lignes. Utile pour inspecter le début d'un fichier très
volumineux ou binaire, ou pour vérifier sa signature :

```bash title="bash"
$ sudo head -c 50 /var/log/syslog
Aug 18 05:06:36 srv01 systemd[1]: Starting logrota
# Identifier un fichier par ses premiers octets (signature PNG)
$ head -c 4 image.png | od -c
0000000 211   P   N   G
0000004
```

> [!TIP] Bon à savoir
> Les suffixes `K`, `M` et `G` sont acceptés (`head -c 1K`). Couper un texte au milieu d'un caractère
> accentué — codé sur plusieurs octets en UTF-8 — peut afficher un symbole illisible en fin de sortie :
> c'est normal avec `-c`.
