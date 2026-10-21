| 🎯 Objectif | 🧭 Contexte | 📶 Niveau |
|:--|:--|:--|
| Envoyer les métriques au tableau de bord | 💻 Ligne de commande | 🟢 Essentiel |

Sur chaque serveur à superviser, exécutez la commande copiée depuis le tableau de bord, **avec l'utilisateur qui
fait tourner PM2**. Elle prend la clé secrète, la clé publique et, en option, le nom sous lequel le serveur
apparaîtra.

```bash title="bash"
$ pm2 link <clé_secrète> <clé_publique> [nom_du_serveur]
$ pm2 link abcd1234efgh567 wxyz9876stuv543 app01
[PM2 I/O] Using: Public key: wxyz9876stuv543 | Private key: abcd1234efgh567 | Machine name: app01
[+] PM2+ activated!
```

Dans un conteneur ou un déploiement automatisé, les **variables d'environnement** remplacent la commande : PM2
se connecte seul au démarrage.

```bash title="bash"
$ export PM2_SECRET_KEY=<clé_secrète>
$ export PM2_PUBLIC_KEY=<clé_publique>
$ export PM2_MACHINE_NAME=app01          # facultatif
```

| Commande | Effet |
|:--|:--|
| `pm2 link info` | État de l'agent : connecté ou « Interactor is offline » |
| `pm2 link stop` | Arrêter l'agent (PM2 recharge alors toutes les applications) |
| `pm2 open` | Ouvrir le tableau de bord du serveur dans le navigateur |

> [!WARNING] « Not managed to connect to PM2 Plus »
> Ce message signifie que l'agent n'arrive pas à joindre PM2 Plus : il réessaie en arrière-plan. Vérifiez que le
> serveur peut **sortir en HTTPS** (port 443) et consultez `~/.pm2/agent.log`, qui indique par exemple « Error
> while trying to retrieve endpoints ».
