| 🎯 Objectif | 🧭 Contexte | 📶 Niveau |
|:--|:--|:--|
| Désinstaller proprement une extension | 💻 Ligne de commande | 🔵 Pratique |

Pour supprimer `pm2-server-monit` — ou n'importe quel autre module — utilisez `pm2 uninstall` : la commande
arrête le processus du module, le retire de la liste et efface ses fichiers.

```bash title="bash"
$ pm2 uninstall pm2-server-monit
[PM2][Module] Uninstalling module pm2-server-monit
[PM2] [pm2-server-monit](1) ✓
In memory process deleted
Deleting /home/deploy/.pm2/modules/pm2-server-monit
```

| Commande | Pour… |
|:--|:--|
| `pm2 uninstall <module>` | un module : processus arrêté et fichiers supprimés |
| `pm2 delete <application>` | une application : retirée de la liste, fichiers conservés |
| `pm2 module:update <module>` | mettre un module à jour |

> [!WARNING] pm2 delete n'est pas fait pour les modules
> Un module supprimé avec `pm2 delete` reste installé dans `~/.pm2/modules` et **revient au prochain démarrage**
> de PM2. Utilisez toujours `pm2 uninstall`.
