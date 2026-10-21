| 🎯 Objectif | 🐧 Systèmes | 🚦 Risque |
|:--|:--|:--|
| Éliminer les doublons laissés par l'interruption | RHEL · Rocky Linux · AlmaLinux · Fedora | 🟡 Modéré |

Cette commande supprime, pour chaque paquet en double, **la version la plus ancienne** et conserve la plus
récente :

```bash title="bash"
$ sudo dnf remove --duplicates
# Vérifier : la commande ne doit plus rien signaler
$ sudo dnf check
```

> [!WARNING] Relire la transaction
> Comme pour toute suppression, relisez la transaction proposée avant de répondre `y` : les versions retirées
> doivent toutes être des **anciennes versions** de paquets toujours présents.
