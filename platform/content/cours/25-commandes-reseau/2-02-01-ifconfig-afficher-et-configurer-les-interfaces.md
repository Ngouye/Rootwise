| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `net-tools` | Lecture : utilisateur · Modification : root | 🟠 Obsolète |

`ifconfig` (*interface configurator*) est l'outil historique de configuration des interfaces réseau. Il affiche
l'état des interfaces actives — adresses IPv4 et IPv6, adresse MAC, MTU (unité de transmission maximale),
compteurs de paquets — et permet aussi d'attribuer une adresse IP ou d'activer et désactiver une interface à la
demande.

## Afficher les interfaces

```bash title="bash"
# Interfaces actives uniquement
$ ifconfig
# Toutes les interfaces, y compris celles qui sont désactivées
$ ifconfig -a
# Une interface précise
$ ifconfig enp1s0
enp1s0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.24  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::5054:ff:fe3a:1c2b  prefixlen 64  scopeid 0x20<link>
        ether 52:54:00:3a:1c:2b  txqueuelen 1000  (Ethernet)
        RX packets 169854  bytes 174146270 (166.0 MiB)
        TX packets 125995  bytes 21062129 (20.0 MiB)
```

Lecture de la sortie : `flags` indique l'état de l'interface (UP, RUNNING), `inet` l'adresse IPv4 et son masque,
`ether` l'adresse MAC, `mtu` la taille maximale des trames ; les compteurs RX et TX donnent le volume reçu et
émis.

## Configurer une interface

```bash title="bash"
# Attribuer une adresse IP et un masque
$ sudo ifconfig eth0 192.168.56.5 netmask 255.255.255.0
# Activer puis désactiver l'interface
$ sudo ifconfig eth0 up
$ sudo ifconfig eth0 down
# Modifier la MTU (trames jumbo)
$ sudo ifconfig eth0 mtu 9000
```

> [!WARNING] Outil obsolète
> `ifconfig` appartient au paquet `net-tools`, qui n'évolue plus et n'est souvent plus installé par défaut.
> Préférez la commande `ip` (fiche 02). Les modifications ne sont pas persistantes : elles disparaissent au
> redémarrage.
