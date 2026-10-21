![Partie 01](images/p07-bandeau-partie.webp)

Ces outils permettent de **configurer les interfaces**, de **vérifier la connectivité** et de **comprendre le
chemin** emprunté par les paquets. Ce sont les premiers réflexes de tout diagnostic réseau, du poste de travail
au serveur de production.

![Du poste au serveur distant : srv01 (enp1s0, 192.168.1.24 ; ip, nmcli, ifconfig, ethtool), le commutateur du LAN 192.168.1.0/24, la passerelle 192.168.1.1 (route, ip route) et l'hôte distant 8.8.8.8 (dig, host) ; ping, traceroute et mtr testent la connectivité et le chemin de bout en bout](images/p07-illustration-3.webp "Du poste au serveur distant")

| Fiche | Commande | Rôle |
|:-:|:--|:--|
| 01 | `ifconfig` | Afficher et configurer les interfaces |
| 02 | `ip` | Adresses, liens, routes et voisins |
| 03 | `ifup` · `ifdown` · `ifquery` | Activer, désactiver, interroger une interface |
| 04 | `ethtool` | Paramètres de la carte réseau et du pilote |
| 05 | `ping` | Tester la connectivité (ICMP) |
| 06 | `traceroute` | Tracer le chemin vers un hôte |
| 07 | `mtr` | Ping et traceroute en temps réel |
| 08 | `route` | Afficher et modifier la table de routage |
| 09 | `nmcli` | Piloter NetworkManager |
