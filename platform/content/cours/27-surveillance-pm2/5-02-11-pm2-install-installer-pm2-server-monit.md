| 🎯 Objectif | 🧭 Contexte | 📶 Niveau |
|:--|:--|:--|
| Mesurer les signaux vitaux du serveur | 💻 Ligne de commande | 🟢 Essentiel |

Les **modules PM2** sont des extensions que PM2 installe et fait tourner comme des processus.
`pm2-server-monit` relève automatiquement les signaux vitaux de la machine.

```bash title="bash"
$ pm2 install pm2-server-monit
[PM2][Module] Module downloaded
[PM2] App [pm2-server-monit] launched (1 instances)
[PM2][Module] Module successfully installed and launched
[PM2][Module] Checkout module options: `$ pm2 conf`
```

![Les signaux vitaux relevés par pm2-server-monit : processeur (CPU usage), mémoire (Used / Free memory), disque (Avail. Disk, Used space), réseau (débit entrant, sortant), processus (Total, Zombie processes), sessions (TTY/SSH opened) et fichiers ouverts (Opened FD)](images/figure-08.webp "Figure 8 — Les signaux vitaux relevés par pm2-server-monit.")

Si le serveur est relié à PM2 Plus, le module apparaît automatiquement dans le tableau de bord, avec ses
graphiques. Sinon, consultez ses valeurs dans le terminal :

```bash title="bash"
$ pm2 show pm2-server-monit
│ CPU usage               │ 0 %       │
│ Avail. Disk             │ 68.35 %   │
│ Used memory             │ 0.55 GB   │
│ Opened FD               │ 294       │
│ TTY/SSH opened          │ 0         │
│ Total Processes         │ 37        │
│ Zombie processes        │ 0         │
```

> [!NOTE] Une métrique manque ?
> D'après la documentation du module, une métrique absente n'est pas prise en charge sur votre plateforme. Les
> mesures réseau, en particulier, dépendent de l'interface détectée. Consultez `pm2 logs pm2-server-monit` en
> cas de doute.
