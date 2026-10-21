| 🎯 Objectif | 🐧 Systèmes | 🚦 Risque |
|:--|:--|:--|
| Obtenir un système cohérent avec les dépôts | RHEL · Rocky Linux · AlmaLinux · Fedora | 🟡 Modéré |

Dernière étape : vider les caches, puis synchroniser chaque paquet installé avec la version disponible dans les
dépôts. `distro-sync` met à jour — et si nécessaire **rétrograde** — les paquets pour obtenir un système
parfaitement aligné :

```bash title="bash"
$ sudo dnf clean all
$ sudo dnf distro-sync
# Contrôle final
$ sudo dnf check
```

> [!WARNING] Attention aux rétrogradations
> `distro-sync` peut rétrograder un paquet installé depuis une source extérieure ou plus récent que le dépôt.
> Lisez le résumé de la transaction avant de confirmer.
