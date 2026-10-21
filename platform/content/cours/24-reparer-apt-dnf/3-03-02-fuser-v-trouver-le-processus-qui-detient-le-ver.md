| 🎯 Objectif | 🐧 Systèmes | 🚦 Risque |
|:--|:--|:--|
| Identifier le programme qui bloque apt | Debian · Ubuntu · Linux Mint | ⚪ Aucun |

La commande `fuser` (paquet `psmisc`) indique quels processus utilisent un fichier. Appliquée au verrou de
dpkg, elle désigne immédiatement le responsable :

```bash title="bash"
$ sudo fuser -v /var/lib/dpkg/lock-frontend
                     USER        PID ACCESS COMMAND
/var/lib/dpkg/lock-frontend:
                     root       2143 F.... unattended-upgr
# Plus de détails sur ce processus
$ ps -fp 2143
```

## Que faire selon le résultat ?

| Situation | Action recommandée |
|:--|:--|
| **unattended-upgrades est actif** | Attendre la fin de l'installation, en suivant sa progression dans `/var/log/unattended-upgrades/` |
| **Un apt ou dpkg lancé par vous ou un collègue** | Le laisser terminer, ou revenir dans sa session tmux |
| **Processus manifestement figé depuis longtemps** | L'arrêter proprement : `sudo kill 2143` (jamais `kill -9` en premier) |
| **Aucun processus affiché** | Vérifier avec `sudo`, puis voir l'étape 03 |

```bash title="bash"
# Suivre l'avancement des mises à jour automatiques
$ sudo tail -f /var/log/unattended-upgrades/unattended-upgrades-dpkg.log
```

> [!WARNING] Patience
> Interrompre un processus en pleine installation peut laisser le système exactement dans l'état défectueux que
> l'on cherche à réparer. **Attendre quelques minutes** est presque toujours la meilleure option.
