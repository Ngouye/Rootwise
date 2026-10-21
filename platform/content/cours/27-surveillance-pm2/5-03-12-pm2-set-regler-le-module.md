| 🎯 Objectif | 🧭 Contexte | 📶 Niveau |
|:--|:--|:--|
| Adapter disques et fréquences de mesure | 💻 Ligne de commande | 🟣 Avancé |

Les réglages d'un module se lisent avec `pm2 conf` et se modifient avec `pm2 set module:clé valeur`. Le module
**redémarre aussitôt** avec la nouvelle valeur.

```bash title="bash"
$ pm2 set pm2-server-monit:disk_refresh_rate 120
[PM2] Module pm2-server-monit restarted
[PM2] Setting changed
$ pm2 set pm2-server-monit:drive /,/var          # surveiller deux partitions
$ pm2 conf pm2-server-monit                      # relire la configuration
```

| Réglage | Défaut | Rôle |
|:--|:-:|:--|
| `drive` | `/` | Partition(s) à surveiller, séparées par des virgules |
| `cpu_refresh_rate` | 2 | Intervalle de mesure du processeur, en secondes |
| `memory_refresh_rate` | 2 | Intervalle de mesure de la mémoire, en secondes |
| `disk_refresh_rate` | 60 | Intervalle de mesure des disques, en secondes |
| `network_refresh_rate` | 5 | Intervalle de mesure du réseau, en secondes |

> [!TIP] Un module trop gourmand ?
> La documentation du module le recommande : s'il consomme trop de processeur, **augmentez toutes les
> fréquences de rafraîchissement**. Sur un petit serveur, 10 secondes pour le processeur et la mémoire suffisent
> largement.
