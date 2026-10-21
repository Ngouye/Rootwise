| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Relancer automatiquement un service défaillant | `monit` (EPEL sur RHEL) | ⚙️ Service |

**Monit** surveille processus, fichiers, répertoires, systèmes de fichiers et services réseau. Quand une condition
n'est plus remplie — un port qui ne répond plus, un disque trop plein —, il **agit** : redémarrage, alerte par
e-mail ou exécution d'un script.

```ini title="/etc/monit/conf.d/nginx"
check process nginx with pidfile /run/nginx.pid
    start program = "/usr/bin/systemctl start nginx"
    stop program  = "/usr/bin/systemctl stop nginx"
    if failed host 127.0.0.1 port 80 protocol http then restart
    if cpu > 80% for 5 cycles then alert
    if 3 restarts within 5 cycles then unmonitor

check filesystem rootfs with path /
    if space usage > 85% then alert
```

```bash title="bash"
$ sudo monit -t                  # vérifier la syntaxe
$ sudo monit reload
$ sudo monit summary
┌─────────────────────────┬─────────────────────────┬──────────────┐
│ Service Name            │ Status                  │ Type         │
├─────────────────────────┼─────────────────────────┼──────────────┤
│ web01                   │ OK                      │ System       │
│ nginx                   │ OK                      │ Process      │
│ rootfs                  │ OK                      │ Filesystem   │
└─────────────────────────┴─────────────────────────┴──────────────┘
```

> [!WARNING] Interface web
> Monit propose une interface web sur le port **2812** (directive `set httpd`). Limitez-la à localhost ou à un réseau
> d'administration, avec un mot de passe solide. Sur RHEL, la configuration se trouve dans `/etc/monitrc` et
> `/etc/monit.d/`.
