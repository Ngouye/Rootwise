| 🎯 Objectif | 🧭 Contexte | 📶 Niveau |
|:--|:--|:--|
| Voir charge, journaux et métriques en direct | 💻 Ligne de commande | 🟢 Essentiel |

`pm2 monit` ouvre un **tableau de bord plein écran**, rafraîchi en continu. Il se compose de quatre panneaux : la
liste des processus avec leur mémoire, les journaux du processus sélectionné, ses métriques personnalisées et ses
métadonnées.

```bash title="bash"
$ pm2 monit
```

![pm2 monit sur deploy@app01 : 1. la liste des processus (api deux fois, worker, pm2-server-monit, avec leur mémoire) ; 2. les journaux de api (GET /health, POST /api/orders, WARN slow query: 812 ms…) ; 3. les métriques personnalisées (Heap Usage 77,37 %, Event Loop Latency 0,41 ms, req/sec 3,49, Requêtes en cours 0) ; 4. les métadonnées (App Name api, Namespace default, Restarts 0, Uptime 2m)](images/figure-04.webp "Figure 4 — Les quatre panneaux de pm2 monit (PM2 7).")

| Touche | Action |
|:--|:--|
| **↑ ↓** ou molette | Choisir un processus dans la liste, ou faire défiler un panneau |
| **← →** | Passer d'un panneau à l'autre |
| **Ctrl+C** | Quitter le tableau de bord (les applications continuent de tourner) |

> [!TIP] Bon à savoir
> Le panneau des journaux n'affiche que les **nouvelles lignes** : pour l'historique, utilisez `pm2 logs`
> (fiche 05). Dans PM2 7, `pm2 dashboard` (ou `pm2 dash`) ouvre le même écran.

> [!NOTE] La limite du terminal
> `pm2 monit` montre l'instant présent, sur un seul serveur, et seulement tant que vous le regardez. Pour
> l'historique, plusieurs serveurs ou des alertes, passez au **tableau de bord web** (chapitre suivant).
