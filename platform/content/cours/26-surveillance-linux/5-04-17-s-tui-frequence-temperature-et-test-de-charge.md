| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Détecter le bridage thermique du processeur | `s-tui` (+ `stress-ng`) | 🖥️ Terminal |

`s-tui` affiche en graphiques la **fréquence**, l'**utilisation**, la **température** et la **consommation
électrique** du processeur. Couplé à `stress-ng`, il peut aussi générer une charge pour observer le comportement
de la machine sous pression — et repérer un **bridage thermique** (*throttling*).

```bash title="bash"
$ sudo apt install s-tui stress-ng        # Debian, Ubuntu, Mint
$ sudo dnf install s-tui stress-ng        # Fedora
$ sudo pacman -S s-tui stress-ng          # Arch Linux
$ sudo zypper install s-tui stress-ng     # openSUSE
$ sudo pkg install s-tui                  # FreeBSD
$ sudo s-tui        # sudo donne accès à davantage de capteurs (puissance)
$ s-tui -t          # une ligne de mesures, sans interface graphique
$ s-tui --csv       # enregistrer les mesures dans un fichier CSV
```

| Observation | Interprétation |
|:--|:--|
| Fréquence qui chute quand la température plafonne | Bridage thermique : refroidissement insuffisant |
| Fréquence basse au repos, haute en charge | Comportement normal (gestion d'énergie) |
| Puissance plafonnée à une valeur fixe | Limite d'alimentation (TDP, firmware, BIOS) |

> [!CAUTION] Jamais en production
> Le mode **Stress** sature volontairement le processeur. Réservez-le aux machines de test, aux postes de travail
> ou aux serveurs hors service, et surveillez la température pendant l'essai.
