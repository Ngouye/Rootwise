| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Ignorer un en-tête ou les premières lignes | Toutes distributions (GNU coreutils) | 🔵 Pratique |

Précédé d'un `+`, le nombre désigne la **ligne de départ** au lieu d'un nombre de lignes comptées depuis
la fin. `tail -n +2` affiche donc tout le fichier à partir de la ligne 2 — idéal pour ignorer une ligne
d'en-tête :

```bash title="bash"
# Ignorer la première ligne
$ tail -n +2 /etc/passwd
# Retirer l'en-tête d'un CSV, puis trier sur la 3e colonne
$ tail -n +2 ventes.csv | sort -t, -k3 -n
# Compter les enregistrements d'un CSV, en-tête exclu
$ tail -n +2 ventes.csv | wc -l
```

> [!WARNING] `-n 2` ou `-n +2` ?
> Sans le `+`, `tail -n 2` affiche les **deux dernières** lignes ; avec, `tail -n +2` affiche **tout à partir
> de la deuxième**. Un seul caractère change complètement le résultat.
