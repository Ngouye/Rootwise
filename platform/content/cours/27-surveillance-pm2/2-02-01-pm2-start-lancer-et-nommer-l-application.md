| 🎯 Objectif | 🧭 Contexte | 📶 Niveau |
|:--|:--|:--|
| Confier l'application à PM2 | 💻 Ligne de commande | 🟢 Essentiel |

Lancez l'application avec un **nom explicite** : c'est lui qui s'affichera partout, du terminal au tableau de bord
web.

```bash title="bash"
$ pm2 start app.js --name api
[PM2] Starting /srv/api/app.js in fork_mode (1 instance)
[PM2] Done.
```

En production, décrivez plutôt l'application dans un **fichier de configuration versionné** avec le code.
`pm2 init simple` en génère un modèle minimal, à compléter :

```js title="ecosystem.config.js"
module.exports = {
  apps: [{
    name: 'api',
    script: './app.js',
    instances: 2,                // 2 processus, ou 'max' : un par cœur
    exec_mode: 'cluster',        // répartir la charge entre les instances
    max_memory_restart: '300M',  // relancer au-delà de 300 Mo
    env: { NODE_ENV: 'production', PORT: 3000 }
  }]
};
```

```bash title="bash"
$ pm2 start ecosystem.config.js
[PM2][WARN] Applications api not running, starting...
[PM2] App [api] launched (2 instances)
```

> [!IMPORTANT] Survivre au redémarrage du serveur
> `pm2 save` enregistre la liste des processus et `pm2 startup` crée le service qui relancera PM2 au démarrage
> (voir l'annexe C). Sans ces deux commandes, **la supervision s'arrête au premier redémarrage**.
