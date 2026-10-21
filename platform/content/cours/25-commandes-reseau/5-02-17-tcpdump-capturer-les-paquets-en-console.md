| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `tcpdump` | root (`sudo`) | 🔵 Actif |

`tcpdump` est l'analyseur de paquets en ligne de commande le plus utilisé. Il capture les paquets TCP/IP émis et
reçus sur une interface donnée, les affiche en temps réel ou les enregistre dans un fichier au format **pcap**
pour une analyse ultérieure, par exemple dans Wireshark.

```bash title="bash"
# Lister les interfaces disponibles
$ sudo tcpdump -D
# Capturer sur une interface, sans résolution de noms ni de ports
$ sudo tcpdump -nn -i enp1s0
listening on enp1s0, link-type EN10MB (Ethernet), snapshot length 262144 bytes
09:35:40.287439 IP 192.168.1.24.22 > 192.168.1.10.36398: Flags [P.], ..., length 196
09:35:40.287655 IP 192.168.1.10.36398 > 192.168.1.24.22: Flags [.], ..., length 0
```

```bash title="bash"
# Capturer seulement 5 paquets
$ sudo tcpdump -c 5 -i enp1s0
# Enregistrer la capture dans un fichier
$ sudo tcpdump -i enp1s0 -w capture.pcap
# Relire un fichier de capture
$ tcpdump -nn -r capture.pcap
```

## Filtres de capture (syntaxe BPF)

| Filtre | Effet |
|:--|:--|
| `host 192.168.1.10` | Trafic vers ou depuis cet hôte |
| `src 192.168.1.10` / `dst …` | Selon l'adresse source ou destination |
| `port 53` | Trafic sur le port 53 (DNS) |
| `tcp port 443` | Trafic TCP sur le port 443 (HTTPS) |
| `net 10.0.0.0/8` | Trafic d'un réseau entier |
| `icmp` | Uniquement l'ICMP (ping, traceroute) |

```bash title="bash"
# Les filtres se combinent avec and, or et not
$ sudo tcpdump -nn -i enp1s0 'tcp port 443 and host 192.168.1.10'
```

> [!CAUTION] Confidentialité
> Une capture peut contenir des données sensibles (identifiants, cookies, contenus non chiffrés). Limitez la
> capture au strict nécessaire, protégez les fichiers `.pcap` et supprimez-les après analyse.
