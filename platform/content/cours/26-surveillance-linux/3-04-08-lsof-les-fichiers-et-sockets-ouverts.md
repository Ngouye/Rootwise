| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Savoir qui utilise un fichier, un port ou un montage | `lsof` | 🖥️ Terminal |

Sous Linux, « **tout est fichier** » : fichiers ordinaires, répertoires, sockets réseau, tubes, périphériques.
`lsof` (*list open files*) les liste avec le processus qui les détient. Sans argument, la sortie est énorme :
**filtrez toujours**.

```bash title="bash"
$ sudo lsof -i :443              # qui écoute ou communique sur le port 443 ?
COMMAND  PID     USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
nginx   1021     root   6u   IPv4  24310      0t0  TCP *:https (LISTEN)
nginx   1022 www-data   6u   IPv4  24310      0t0  TCP *:https (LISTEN)
$ sudo lsof +D /mnt/backup       # pourquoi umount répond « target is busy »
$ sudo lsof -u alice             # fichiers ouverts par un utilisateur
$ sudo lsof -p 1873 | wc -l      # nombre de descripteurs d'un processus
```

## Le cas classique : un disque plein… de fichiers supprimés

`df` indique un disque plein, mais `du` ne trouve rien ? Un processus garde probablement ouvert un **fichier
supprimé** — typiquement un journal effacé à la main. L'espace ne sera libéré qu'à la fermeture du fichier :

```bash title="bash"
$ sudo lsof +L1                  # fichiers ouverts mais supprimés
COMMAND  PID USER   FD   TYPE DEVICE   SIZE/OFF NLINK    NODE NAME
java    2875  app  12w    REG  253,0 8589934592     0 1048607 /var/log/app.log (deleted)
# Solution 1 : redémarrer le service. Solution 2 : vider le fichier en place
$ sudo truncate -s 0 /proc/2875/fd/12
```

> [!TIP] Alternative rapide
> `fuser -vm /mnt/backup` répond aussi à la question « qui occupe ce montage ? », avec une sortie plus courte que
> `lsof`.
