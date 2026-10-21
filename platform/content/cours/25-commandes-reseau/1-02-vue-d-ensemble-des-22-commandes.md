Le tableau ci-dessous résume le rôle de chaque outil et son statut actuel. Les outils marqués « Obsolète » ou
« Hérité » restent présents sur de nombreux systèmes : il faut savoir les lire, mais **privilégier leurs
remplaçants modernes** pour tout nouveau travail.

| N° | Commande | Famille | Usage principal | Statut |
|:-:|:--|:--|:--|:--|
| 01 | `ifconfig` | Configuration | Afficher et configurer les interfaces | 🟠 Obsolète |
| 02 | `ip` | Configuration | Adresses, liens, routes et voisins | 🟢 Recommandé |
| 03 | `ifup` · `ifdown` · `ifquery` | Configuration | Activer, désactiver, interroger une interface | ⚪ Selon distribution |
| 04 | `ethtool` | Configuration | Paramètres de la carte réseau et du pilote | 🔵 Actif |
| 05 | `ping` | Dépannage | Tester la connectivité (ICMP) | 🔵 Actif |
| 06 | `traceroute` | Dépannage | Tracer le chemin vers un hôte | 🔵 Actif |
| 07 | `mtr` | Dépannage | Ping et traceroute en temps réel | 🔵 Actif |
| 08 | `route` | Configuration | Afficher et modifier la table de routage | 🟠 Obsolète |
| 09 | `nmcli` | Configuration | Piloter NetworkManager | 🟢 Recommandé |
| 10 | `netstat` | Analyse | Connexions, ports et statistiques | 🟠 Obsolète |
| 11 | `ss` | Analyse | Statistiques des sockets | 🟢 Recommandé |
| 12 | `nc` (netcat) | Analyse | Tester des ports, transférer des données | 🔵 Actif |
| 13 | `nmap` | Analyse · Sécurité | Découverte d'hôtes et scan de ports | 🔵 Actif |
| 14 | `host` | DNS | Résolution DNS simple | 🔵 Actif |
| 15 | `dig` | DNS | Interrogation DNS détaillée | 🟢 Recommandé |
| 16 | `nslookup` | DNS | Interrogation DNS directe ou interactive | 🔵 Actif |
| 17 | `tcpdump` | Capture | Capture de paquets en console | 🔵 Actif |
| 18 | Wireshark | Capture | Analyse graphique des protocoles | 🔵 Actif |
| 19 | `bmon` | Surveillance | Bande passante en temps réel | 🔵 Actif |
| 20 | `iptables` | Pare-feu | Règles Netfilter (filtrage, NAT) | 🟠 Hérité |
| 21 | `firewalld` | Pare-feu | Pare-feu dynamique par zones | 🔵 Actif |
| 22 | `ufw` | Pare-feu | Pare-feu simplifié | 🔵 Actif |

🟢 **Recommandé** : à privilégier · 🔵 **Actif** : courant et maintenu · 🟠 **Obsolète / Hérité** : remplacé par un
outil récent · ⚪ **Selon distribution** : disponibilité variable

## Où agit chaque outil ?

Les outils réseau s'organisent naturellement selon les **couches du modèle OSI**. Repérer la couche concernée par
un incident permet de choisir immédiatement le bon outil — et d'éviter de chercher une panne DNS avec
`ethtool` ou un câble débranché avec `dig`.

![Les outils selon les couches réseau : couche 7 application (DNS, HTTP(S), SSH) : dig, host, nslookup ; couche 4 transport (TCP, UDP, ports) : ss, netstat, nc, nmap ; couche 3 réseau (IP, ICMP, routage) : ip addr, ip route, route, ifconfig, ping, traceroute, mtr ; couche 2 liaison (Ethernet, ARP, MAC) : ip link, ip neigh, nmcli, ifup / ifdown, bmon ; couche 1 physique (carte réseau, câble) : ethtool ; la capture (tcpdump, Wireshark, tshark) traverse toutes les couches et le pare-feu (iptables, firewalld, ufw) agit sur les couches 3 et 4](images/figure-01.webp "Figure 1 — Cartographie des 22 outils selon les couches réseau. La capture traverse toutes les couches ; le pare-feu agit sur les couches 3 et 4.")

> [!TIP] Lecture du schéma
> De bas en haut : on vérifie d'abord le lien physique (`ethtool`), puis l'adressage et le routage (`ip`,
> `ping`), les ports (`ss`, `nmap`) et enfin les services applicatifs comme le DNS (`dig`). Cette progression est
> détaillée dans l'annexe C.
