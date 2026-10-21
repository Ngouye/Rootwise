| 🎯 Objectif | 🧭 Contexte | 📶 Niveau |
|:--|:--|:--|
| Tout savoir d'un processus | 💻 Ligne de commande | 🔵 Pratique |

`pm2 show` (alias de `pm2 describe` et `pm2 info`) ouvre la **fiche complète** d'un processus : chemins des
journaux, version de Node.js, mode d'exécution, nombre de redémarrages, puis les **métriques de code** relevées
automatiquement.

```bash title="bash"
$ pm2 show api
 Describing process with id 1 - name api
│ status            │ online                                 │
│ restarts          │ 0                                      │
│ uptime            │ 6s                                     │
│ error log path    │ /home/deploy/.pm2/logs/api-error-1.log │
│ out log path      │ /home/deploy/.pm2/logs/api-out-1.log   │
│ exec mode         │ cluster_mode                           │
│ node.js version   │ 22.22.0                                │
 Code metrics value
│ HTTP Mean Latency       │ 2 ms      │
│ HTTP P95 Latency        │ 2 ms      │
│ Heap Usage              │ 73.42 %   │
│ Event Loop Latency p95  │ 0.41 ms   │
```

| Métrique | Ce qu'elle indique |
|:--|:--|
| `HTTP Mean` / `P95 Latency` | Temps de réponse moyen et 95e centile des requêtes HTTP |
| `Heap Size` · `Heap Usage` | Mémoire du tas JavaScript et taux d'occupation |
| `Event Loop Latency` | Retard de la boucle d'événements : au-delà de quelques dizaines de ms, l'application sature |
| `Active handles` · `requests` | Connexions, minuteries et requêtes encore ouvertes |

> [!TIP] Actions à distance
> La fiche liste aussi des actions déclenchables à chaud, comme `km:heapdump` ou `km:cpu:profiling:start` :
> `pm2 trigger api km:heapdump` produit un instantané mémoire **sans arrêter l'application**. Les mêmes actions
> sont disponibles en un clic dans PM2 Plus.
