| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Lister ports à l'écoute et connexions actives | `iproute2` (préinstallé) | 🖥️ Terminal |

`netstat` (paquet `net-tools`) est obsolète : il n'est plus installé par défaut sur la plupart des distributions.
Son remplaçant, **`ss`**, est plus rapide et plus précis. Les options courantes sont les mêmes.

```bash title="bash"
$ ss -tuln                       # ports TCP/UDP à l'écoute, sans résolution
Netid State   Recv-Q Send-Q   Local Address:Port    Peer Address:Port
udp   UNCONN  0      0            127.0.0.1:323          0.0.0.0:*
tcp   LISTEN  0      128            0.0.0.0:22           0.0.0.0:*
tcp   LISTEN  0      511            0.0.0.0:80           0.0.0.0:*
tcp   LISTEN  0      4096         127.0.0.1:5432         0.0.0.0:*
# Quel processus écoute sur le port 80 ? (-p demande root)
$ sudo ss -tlpn 'sport = :80'
LISTEN 0 511 0.0.0.0:80 0.0.0.0:* users:(("nginx",pid=1021,fd=6))
$ ss -s                          # résumé : connexions par état
$ ss -tan state established | wc -l
```

| Besoin | Ancienne commande | Commande moderne |
|:--|:--|:--|
| Ports à l'écoute | `netstat -tulpn` | `ss -tulpn` |
| Toutes les connexions | `netstat -an \| more` | `ss -an` |
| Statistiques par protocole | `netstat -s` | `nstat -az` |
| Table de routage | `netstat -r` | `ip route` |
| Compteurs des interfaces | `netstat -i` | `ip -s link` |

> [!NOTE] Lire Recv-Q et Send-Q
> Sur un socket en écoute, `Send-Q` indique la taille maximale de la file des connexions en attente et `Recv-Q`
> son remplissage actuel. Un `Recv-Q` qui approche `Send-Q` signifie que l'application **n'accepte plus les
> connexions assez vite**.
