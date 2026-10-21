| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `bmon` (Debian/Ubuntu · EPEL sur RHEL) | Utilisateur | 🔵 Actif |

`bmon` (*bandwidth monitor*) est un utilitaire de surveillance et de débogage réseau en mode texte pour les
systèmes de type Unix. Il collecte les statistiques de chaque interface et les présente sous forme de
**compteurs et de graphiques** directement dans le terminal. Fiable et léger, il permet de suivre la bande passante
en temps réel et d'estimer le débit.

```bash title="bash"
# Surveiller toutes les interfaces
$ bmon
# Surveiller uniquement une interface
$ bmon -p enp1s0
# Afficher les débits en bits plutôt qu'en octets
$ bmon -b
```

| Touche | Action dans l'interface |
|:-:|:--|
| **↑** / **↓** | Passer d'une interface à l'autre |
| **d** | Afficher ou masquer les statistiques détaillées |
| **g** | Afficher ou masquer les graphiques |
| **i** | Afficher des informations complémentaires sur l'interface |
| **?** | Afficher l'aide |
| **q** | Quitter |

## Outils complémentaires

| Outil | Spécialité |
|:--|:--|
| `iftop` | Bande passante par connexion (qui consomme, vers où) |
| `nload` | Débits entrant et sortant d'une interface, sous forme de graphiques |
| `nethogs` | Bande passante consommée par processus |
| `vnstat` | Historique de consommation (horaire, journalier, mensuel) |
