| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Identifier le programme qui consomme le réseau | `nethogs` (EPEL sur RHEL) | 🖥️ Terminal |

`iftop` montre **qui** échange ; `nethogs` montre **quel programme local** en est responsable. Il regroupe le trafic
par processus plutôt que par protocole ou par sous-réseau.

```bash title="bash"
$ sudo nethogs enp0s3
NetHogs version 0.8.7

    PID USER     PROGRAM                     DEV        SENT     RECEIVED
   3310 root     /usr/bin/rsync              enp0s3  1843.512     24.118 KB/sec
   1021 www-data nginx: worker process       enp0s3   412.906     38.274 KB/sec
    905 root     sshd: alice@pts/0           enp0s3     1.204      0.352 KB/sec
      ? root     unknown TCP                            0.000      0.000 KB/sec

  TOTAL                                              2257.622     62.744 KB/sec
```

| Option ou touche | Effet |
|:--|:--|
| `-d 5` | Rafraîchir toutes les 5 secondes |
| **m** | Changer d'unité : KB/s, puis totaux en KB, B et MB |
| **s** / **r** | Trier par volume envoyé / reçu |
| **q** | Quitter |

> [!IMPORTANT] Correction
> La commande s'écrit bien `nethogs` (et non « hogs »). Sans nom d'interface, elle écoute toutes les interfaces
> actives ; préciser l'interface réduit le bruit sur les serveurs qui en ont plusieurs.
