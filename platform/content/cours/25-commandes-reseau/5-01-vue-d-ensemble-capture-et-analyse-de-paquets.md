![Partie 04](images/p27-bandeau-partie.webp)

Lorsque les autres outils ne suffisent plus, il faut **observer le trafic lui-même**. Les analyseurs de paquets
capturent ce qui transite réellement sur une interface : ils permettent de comprendre un échange protocolaire
dans ses moindres détails.

![tcpdump -i enp1s0 -w capture.pcap capture le trafic TCP, DNS, TLS, HTTP et ICMP entre un client (192.168.1.10) et un serveur (192.168.1.24) ; le fichier capture.pcap (1 248 paquets) est ensuite analysé couche par couche dans Wireshark ou tshark : Ethernet II, IPv4 de 192.168.1.10 vers 192.168.1.24, TCP du port 36398 vers 443 [SYN], puis TLS Client Hello](images/p27-illustration-3.webp "Capturer, puis analyser couche par couche")

| Fiche | Outil | Rôle |
|:-:|:--|:--|
| 17 | `tcpdump` | Capture de paquets en console |
| 18 | Wireshark | Analyse graphique des protocoles |
