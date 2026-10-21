| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `net-tools` | Lecture : utilisateur · Modification : root | 🟠 Obsolète |

`route` affiche et modifie la table de routage IP du noyau. Elle sert principalement à définir des **routes
statiques** vers un hôte ou un réseau, via une passerelle et une interface données.

```bash title="bash"
# Table de routage avec adresses numériques
$ route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         192.168.1.1     0.0.0.0         UG    100    0        0 enp1s0
192.168.1.0     0.0.0.0         255.255.255.0   U     100    0        0 enp1s0
```

Le drapeau **U** signale une route active et **G** une route qui passe par une passerelle. La destination
`0.0.0.0` correspond à la route par défaut.

```bash title="bash"
# Ajouter une passerelle par défaut
$ sudo route add default gw 192.168.1.1
# Ajouter une route vers un réseau via une passerelle et une interface
$ sudo route add -net 10.10.0.0 netmask 255.255.255.0 gw 192.168.1.254 dev eth0
# Supprimer cette route
$ sudo route del -net 10.10.0.0 netmask 255.255.255.0
```

| Avec route (historique) | Avec ip (moderne) |
|:--|:--|
| `route -n` | `ip route show` |
| `route add default gw 192.168.1.1` | `ip route add default via 192.168.1.1` |
| `route add -net 10.10.0.0 netmask 255.255.255.0 gw 192.168.1.254` | `ip route add 10.10.0.0/24 via 192.168.1.254` |
| `route del -net 10.10.0.0 netmask 255.255.255.0` | `ip route del 10.10.0.0/24` |
