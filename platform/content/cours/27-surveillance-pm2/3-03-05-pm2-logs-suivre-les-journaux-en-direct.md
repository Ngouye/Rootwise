| 🎯 Objectif | 🧭 Contexte | 📶 Niveau |
|:--|:--|:--|
| Comprendre ce que fait l'application | 💻 Ligne de commande | 🟢 Essentiel |

PM2 capture la **sortie standard** et la **sortie d'erreur** de chaque processus dans des fichiers séparés.
`pm2 logs` les affiche en continu ; ajoutez un nom pour n'en suivre qu'un seul.

```bash title="bash"
$ pm2 logs api --lines 20                # 20 dernières lignes, puis suivi en direct
$ pm2 logs worker --err --nostream       # erreurs seulement, sans suivi
/home/deploy/.pm2/logs/worker-error.log last 15 lines:
3|worker  | Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
3|worker  |   code: 'EADDRINUSE',
3|worker  |   port: 3000
```

Le diagnostic est immédiat : `worker` tente d'écouter le port 3000, déjà pris par `api`. Il suffit de lui attribuer
un autre port.

| Option | Effet |
|:--|:--|
| `--lines N` | Afficher les N dernières lignes (15 par défaut) |
| `--nostream` | Afficher puis rendre la main, sans suivi en direct |
| `--err` · `--out` | Seulement la sortie d'erreur · seulement la sortie standard |
| `--json` · `--raw` | Sortie JSON (pour un outil) · lignes brutes, sans préfixe |
| `--timestamp` | Ajouter l'heure à chaque ligne du suivi |

> [!WARNING] Des journaux qui grossissent sans fin
> Les fichiers de `~/.pm2/logs` ne sont **jamais vidés automatiquement**. Installez le module `pm2-logrotate`
> (annexe C) ; en cas d'urgence, `pm2 flush` vide tous les journaux d'un coup.
