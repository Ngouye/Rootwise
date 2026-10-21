| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Retirer la fin d'un fichier à l'affichage | GNU coreutils (Linux) · absent de macOS/BSD | 🟣 Avancé |

Fonction propre à la version GNU : un nombre **négatif** affiche tout le fichier **sauf** les N dernières
lignes. Pratique pour retirer une ligne de total ou de pied de page d'un export, ou ignorer les dernières
entrées d'un journal :

```bash title="bash"
# Tout sauf les 5 dernières lignes
$ head -n -5 access.log
# Retirer la ligne de total d'un export CSV
$ head -n -1 export.csv > export_sans_total.csv
# Même principe en octets : tout sauf les 100 derniers
$ head -c -100 fichier.txt
```

> [!WARNING] Portabilité
> Sur macOS et les BSD, `head` n'accepte pas de valeur négative. Installez les GNU coreutils (commande
> `ghead`) ou, pour retirer la seule dernière ligne, utilisez `sed '$d' fichier`.
