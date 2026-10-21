Ces annexes rassemblent les informations pratiques à garder sous la main : aide-mémoire, correspondances entre
outils, méthode de diagnostic, installation, bonnes pratiques et glossaire.

## A. Aide-mémoire : « Je veux… »

| Je veux… | Commande |
|:--|:--|
| Afficher mes adresses IP | `ip -br addr` |
| Connaître ma passerelle | `ip route` |
| Vérifier le lien physique | `sudo ethtool enp1s0` |
| Tester qu'une machine répond | `ping -c 4 <hôte>` |
| Trouver où la connexion se dégrade | `mtr -rw <hôte>` |
| Voir les ports en écoute | `sudo ss -tulpn` |
| Tester un port distant | `nc -zv <hôte> <port>` |
| Découvrir les machines du réseau | `nmap -sn 192.168.1.0/24` |
| Résoudre un nom de domaine | `dig +short <nom>` |
| Capturer le trafic d'une interface | `sudo tcpdump -nn -i enp1s0` |
| Surveiller la bande passante | `bmon` |
| Lister les connexions NetworkManager | `nmcli connection show` |
| Voir les règles du pare-feu | `sudo ufw status` · `sudo firewall-cmd --list-all` · `sudo nft list ruleset` |

## B. Correspondance net-tools → iproute2

Le paquet `net-tools` (`ifconfig`, `route`, `netstat`, `arp`) est remplacé par la suite **iproute2**. Ce tableau
facilite la transition :

| Ancienne commande | Équivalent moderne | Rôle |
|:--|:--|:--|
| `ifconfig` | `ip addr` | Afficher les interfaces |
| `ifconfig eth0 up` | `ip link set eth0 up` | Activer une interface |
| `ifconfig eth0 mtu 9000` | `ip link set eth0 mtu 9000` | Modifier la MTU |
| `route -n` | `ip route` | Table de routage |
| `route add default gw <ip>` | `ip route add default via <ip>` | Passerelle par défaut |
| `arp -n` | `ip neigh` | Table ARP / voisins |
| `netstat -tulpn` | `ss -tulpn` | Ports en écoute |
| `netstat -i` | `ip -s link` | Statistiques d'interfaces |
| `netstat -r` | `ip route` | Table de routage |

## C. Méthode de diagnostic en 8 étapes

Face à un incident, procédez **de la couche la plus basse vers la plus haute**. Chaque étape validée élimine une
catégorie de causes :

| # | Étape | Question | Commandes |
|:-:|:--|:--|:--|
| 1 | **Lien physique** | L'interface est-elle active, le câble branché ? | `ip -br link` · `ethtool` |
| 2 | **Adressage IP** | L'adresse et le masque sont-ils corrects ? | `ip -br addr` · `nmcli device show` |
| 3 | **Réseau local** | La passerelle répond-elle ? | `ip route` · `ping <passerelle>` · `ip neigh` |
| 4 | **Accès externe** | Une adresse publique est-elle joignable ? | `ping 1.1.1.1` · `mtr -rw 1.1.1.1` |
| 5 | **Résolution DNS** | Les noms sont-ils résolus ? | `dig <nom>` · `resolvectl status` |
| 6 | **Service** | Le port est-il ouvert et en écoute ? | `ss -tulpn` · `nc -zv` · `nmap -p` |
| 7 | **Pare-feu** | Un filtrage bloque-t-il le flux ? | `ufw status` · `firewall-cmd --list-all` · `nft list ruleset` |
| 8 | **Analyse fine** | Que se passe-t-il réellement sur le réseau ? | `tcpdump` · Wireshark |

## D. Installation des outils

| Commande(s) | Debian / Ubuntu (apt) | RHEL / Fedora (dnf) |
|:--|:--|:--|
| `ifconfig`, `route`, `netstat` | `net-tools` | `net-tools` |
| `ip`, `ss` | `iproute2` | `iproute` |
| `ifup`, `ifdown`, `ifquery` | `ifupdown` | — (NetworkManager) |
| `ethtool` | `ethtool` | `ethtool` |
| `ping` | `iputils-ping` | `iputils` |
| `traceroute` | `traceroute` | `traceroute` |
| `mtr` | `mtr` / `mtr-tiny` | `mtr` |
| `nmcli` | `network-manager` | `NetworkManager` |
| `nc` | `netcat-openbsd` | `nmap-ncat` |
| `nmap` | `nmap` | `nmap` |
| `host`, `dig`, `nslookup` | `bind9-dnsutils` | `bind-utils` |
| `tcpdump` | `tcpdump` | `tcpdump` |
| `wireshark`, `tshark` | `wireshark`, `tshark` | `wireshark`, `wireshark-cli` |
| `bmon` | `bmon` | `bmon` (EPEL) |
| `iptables` | `iptables` | `iptables-nft` |
| `firewall-cmd` | `firewalld` | `firewalld` |
| `ufw` | `ufw` | `ufw` (EPEL) |

```bash title="bash"
# Debian / Ubuntu
$ sudo apt update && sudo apt install -y iproute2 bind9-dnsutils mtr-tiny tcpdump nmap
# RHEL / Fedora / Rocky Linux / AlmaLinux
$ sudo dnf install -y iproute bind-utils mtr tcpdump nmap
```

## E. Bonnes pratiques et sécurité

- Gardez une **seconde session SSH** ouverte lorsque vous modifiez le réseau ou le pare-feu d'un serveur distant,
  et testez avant de fermer la première ;
- Rendez vos changements **persistants** avec l'outil de la distribution (`nmcli`, Netplan,
  `/etc/network/interfaces`) : `ip`, `ifconfig` et `route` ne survivent pas au redémarrage ;
- N'utilisez qu'**un seul gestionnaire de pare-feu** par serveur (ufw, firewalld ou nftables) ;
- Ne scannez que des **systèmes autorisés** : `nmap` et `nc` sur un réseau tiers peuvent constituer une
  infraction ;
- **Protégez les captures** : les fichiers `.pcap` peuvent contenir des mots de passe et des données personnelles ;
- Utilisez l'option `-n` (`ss`, `netstat`, `traceroute`, `tcpdump`) pour accélérer les diagnostics en évitant les
  résolutions DNS ;
- **Documentez** chaque intervention : commande exécutée, date, motif et moyen de retour arrière.

## F. Sources et références

- Aaron Kili, « 22 commandes réseau Linux pour administrateur système », *Tecmint*, mis à jour le 23 juillet
  2025 — tecmint.com/linux-networking-commands. Article dont ce guide reprend le plan et qu'il enrichit.
- Pages de manuel Linux : `ip(8)`, `ss(8)`, `nmcli(1)`, `ethtool(8)`, `tcpdump(8)`, `nmap(1)`, `dig(1)`,
  `firewall-cmd(1)`, `ufw(8)`, `iptables(8)`, `nft(8)`.
- Documentations officielles : nmap.org, wireshark.org, firewalld.org, netfilter.org.

## G. Glossaire

| Terme | Définition |
|:--|:--|
| **ARP / NDP** | Protocoles qui associent une adresse IP (IPv4 / IPv6) à une adresse MAC sur le réseau local |
| **CIDR** | Notation d'un réseau par préfixe, par exemple 192.168.1.0/24 (masque 255.255.255.0) |
| **DNS** | Système de noms de domaine : traduit les noms (example.com) en adresses IP |
| **ICMP** | Protocole de messages de contrôle et d'erreur d'IP, utilisé par ping et traceroute |
| **Interface** | Point de connexion réseau d'un système, physique (enp1s0) ou virtuel (lo, virbr0) |
| **LAN / WAN** | Réseau local / réseau étendu (Internet, liaisons entre sites) |
| **MAC** | Adresse matérielle unique d'une carte réseau (ex. 52:54:00:3a:1c:2b) |
| **MTU** | Unité de transmission maximale : taille maximale d'une trame (1500 octets en Ethernet) |
| **NAT** | Traduction d'adresses réseau, par exemple pour partager une adresse IP publique |
| **Netfilter** | Framework du noyau Linux qui filtre et transforme les paquets ; piloté par iptables, nftables, firewalld ou ufw |
| **Passerelle** | Routeur par lequel transitent les paquets destinés aux autres réseaux |
| **pcap** | Format de fichier standard des captures de paquets (tcpdump, Wireshark) |
| **Port** | Numéro (0 à 65 535) identifiant un service sur une machine : 22 = SSH, 443 = HTTPS |
| **RTT** | *Round-Trip Time* : temps d'aller-retour d'un paquet, mesuré par ping et mtr |
| **Socket** | Point de communication défini par une adresse IP, un port et un protocole |
| **TTL** | *Time To Live* : durée de vie d'un paquet IP (en sauts) ou d'un enregistrement DNS (en secondes) |
| **Zone** | Dans firewalld, ensemble de règles de confiance associé à des interfaces ou à des sources |
