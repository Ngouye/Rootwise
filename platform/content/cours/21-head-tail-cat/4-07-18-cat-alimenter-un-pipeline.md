| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Envoyer un fichier à d'autres outils | Toutes distributions (GNU coreutils) | 🔵 Pratique |

`cat` alimente volontiers d'autres commandes via un tube (`|`). Exemple : classer les adresses IP à
l'origine d'échecs de connexion SSH, de la plus fréquente à la moins fréquente :

```bash title="bash"
$ sudo cat /var/log/auth.log | grep 'Failed password' \
    | grep -oE 'from [0-9.]+' | awk '{print $2}' | sort | uniq -c | sort -rn
     42 203.0.113.7
     17 198.51.100.23
      3 192.168.1.50
```

Extraire l'adresse avec `grep -oE 'from [0-9.]+'` plutôt qu'avec un numéro de colonne `awk` rend la
commande indépendante du format d'horodatage du journal. Pour un seul fichier, `cat` est d'ailleurs
superflu : `grep` lit directement le fichier.

```bash title="bash"
$ sudo grep 'Failed password' /var/log/auth.log | grep -oE 'from [0-9.]+' \
    | awk '{print $2}' | sort | uniq -c | sort -rn

# RHEL / Rocky / AlmaLinux : remplacer /var/log/auth.log par /var/log/secure
```

> [!NOTE] « Useless use of cat »
> Le motif `cat fichier | commande` au lieu de `commande fichier` est surnommé « useless use of cat ». Il
> est sans danger mais crée un processus inutile. `cat` reste en revanche indispensable pour enchaîner
> **plusieurs fichiers** dans un même pipeline.
