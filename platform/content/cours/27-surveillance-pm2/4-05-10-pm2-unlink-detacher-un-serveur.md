| 🎯 Objectif | 🧭 Contexte | 📶 Niveau |
|:--|:--|:--|
| Arrêter l'envoi des données | 💻 Ligne de commande | 🔵 Pratique |

Pour retirer un serveur du tableau de bord, détachez-le d'abord **depuis le serveur lui-même** :

```bash title="bash"
$ pm2 unlink
[PM2 I/O] Permanently disable agent...
[PM2 I/O] Agent interaction ended
```

L'agent s'arrête et sa configuration (`~/.pm2/agent.json5`) est supprimée : le serveur n'enverra plus rien, même
après un redémarrage. Il ne reste plus qu'à supprimer le serveur dans le tableau de bord app.pm2.io, où il
apparaît désormais hors ligne.

| Commande | Effet | Reprise |
|:--|:--|:--|
| `pm2 link stop` | Agent arrêté temporairement | `pm2 link` (sans argument) |
| `pm2 unlink` | Agent désactivé, clés oubliées | `pm2 link` avec les clés |

> [!NOTE] Les applications continuent de tourner
> Détacher un serveur coupe **seulement la supervision web**. Vos processus restent gérés par PM2 et `pm2 monit`
> fonctionne toujours.
