| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `iproute2` (Debian/Ubuntu) · `iproute` (RHEL/Fedora) | Lecture : utilisateur · Modification : root | 🟢 Recommandé |

`ip`, issue de la suite **iproute2**, est l'outil de référence pour afficher et manipuler les adresses, les
interfaces (liens), le routage et la table des voisins. Elle remplace à elle seule `ifconfig`, `route` et `arp`. Sa
syntaxe suit toujours le même modèle : `ip [options] objet commande`.

| Objet | Rôle | Exemple |
|:--|:--|:--|
| `addr` (`a`) | Adresses IPv4 et IPv6 | `ip addr show` |
| `link` (`l`) | Interfaces physiques et virtuelles | `ip link show` |
| `route` (`r`) | Table de routage | `ip route show` |
| `neigh` (`n`) | Table des voisins (ARP / NDP) | `ip neigh show` |

## Afficher les adresses

```bash title="bash"
# Vue synthétique : une ligne par interface
$ ip -br addr
lo               UNKNOWN        127.0.0.1/8 ::1/128
enp1s0           UP             192.168.1.24/24 fe80::5054:ff:fe3a:1c2b/64
wlp2s0           DOWN
# Vue détaillée d'une interface
$ ip addr show enp1s0
2: enp1s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP
    link/ether 52:54:00:3a:1c:2b brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.24/24 brd 192.168.1.255 scope global dynamic enp1s0
       valid_lft 85912sec preferred_lft 85912sec
```

## Gérer les adresses et les interfaces

```bash title="bash"
# Ajouter puis supprimer une adresse (temporaire)
$ sudo ip addr add 192.168.56.10/24 dev eth0
$ sudo ip addr del 192.168.56.10/24 dev eth0
# Activer / désactiver une interface
$ sudo ip link set eth0 up
$ sudo ip link set eth0 down
# Statistiques détaillées (paquets, erreurs, pertes)
$ ip -s link show eth0
```

## Routes et voisins

```bash title="bash"
$ ip route show
default via 192.168.1.1 dev enp1s0 proto dhcp metric 100
192.168.1.0/24 dev enp1s0 proto kernel scope link src 192.168.1.24
# Quelle route sera utilisée pour joindre cette destination ?
$ ip route get 8.8.8.8
# Table des voisins (équivalent moderne de arp)
$ ip neigh show
192.168.1.1 dev enp1s0 lladdr 10:fe:ed:3d:f3:82 REACHABLE
```

> [!TIP] Astuce
> Les objets s'abrègent : `ip a`, `ip r`, `ip n`. L'option `-c` colore la sortie (`ip -c a`) et `-j` produit du
> JSON, idéal pour les scripts et l'automatisation.

> [!WARNING] Persistance
> Les changements effectués avec `ip` sont **perdus au redémarrage**. Pour une configuration durable, utilisez
> NetworkManager (`nmcli`), Netplan sur Ubuntu ou le fichier `/etc/network/interfaces` sur Debian.
