| 🎯 Objectif | 🐧 Systèmes | 🚦 Risque |
|:--|:--|:--|
| Installer ou corriger les dépendances manquantes | Debian · Ubuntu · Linux Mint | 🟡 Modéré |

La configuration des paquets révèle souvent des dépendances manquantes ou incohérentes. apt le signale
explicitement et propose lui-même la solution :

```bash title="bash"
$ sudo apt upgrade
E: Unmet dependencies. Try 'apt --fix-broken install' with no packages
   (or specify a solution).
# Réparer automatiquement les dépendances
$ sudo apt install -f
```

L'option `-f` (`--fix-broken`) demande à apt de calculer et d'appliquer les corrections nécessaires :
installation des dépendances manquantes et finalisation des paquets partiels.

> [!WARNING] Lire avant de confirmer
> Il arrive que `apt install -f` propose de **supprimer** des paquets pour résoudre un conflit. Relisez la liste
> avant de valider : si un paquet important (noyau, serveur web, base de données) figure parmi les
> suppressions, répondez **n** et analysez la situation.
