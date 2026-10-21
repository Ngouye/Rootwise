| 🎯 Objectif | 🧭 Contexte | 📶 Niveau |
|:--|:--|:--|
| Suivre vos propres indicateurs | 🧩 Code de l'application | 🟣 Avancé |

Au-delà du processeur et de la mémoire, vous pouvez exposer **vos propres indicateurs** : requêtes par seconde,
utilisateurs connectés, file d'attente… La documentation de PM2 recommande la bibliothèque **tx2**, à installer
dans le projet.

```bash title="bash"
$ npm install tx2
```

```js title="app.js"
const http = require('http');
const tx2 = require('tx2');

const reqs = tx2.meter({ name: 'req/sec', samples: 1, timeframe: 60 });
const actives = tx2.counter({ name: 'Requêtes en cours' });

http.createServer((req, res) => {
  reqs.mark(); actives.inc();
  setTimeout(() => { res.end('ok\n'); actives.dec(); }, 20);
}).listen(process.env.PORT || 3000);
```

```bash title="bash"
$ pm2 show api
 Code metrics value
│ req/sec                 │ 3.49      │
│ Requêtes en cours       │ 0         │
```

![Les quatre types de métriques tx2 : metric, une valeur instantanée (tx2.metric({ name, value }), par exemple les utilisateurs connectés) ; counter, un compteur qui monte et descend (c.inc(), c.dec() : les requêtes en cours) ; meter, une fréquence (m.mark() : les requêtes par seconde) ; histogram, une distribution (h.update(valeur) : la latence moyenne)](images/figure-05.webp "Figure 5 — Les quatre types de métriques de tx2.")

> [!NOTE] Où les retrouver ?
> Les métriques personnalisées apparaissent dans `pm2 show`, dans le panneau « Custom Metrics » de `pm2 monit`
> et, si le serveur est relié, dans le tableau de bord PM2 Plus — **sans configuration supplémentaire**.
