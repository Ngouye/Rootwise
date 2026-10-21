| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Voir exactement ce qui circule sur le réseau | `tcpdump` | 🖥️ Terminal |

`tcpdump` capture les paquets reçus ou émis sur une interface, les affiche ou les enregistre dans un fichier
`.pcap` à analyser ensuite, par exemple avec Wireshark. C'est l'**outil ultime** quand les autres ne suffisent
plus.

```bash title="bash"
$ sudo tcpdump -i enp0s3 -nn -c 3 port 22
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on enp0s3, link-type EN10MB (Ethernet), snapshot length 262144 bytes
10:19:34.635893 IP 192.168.0.10.22 > 192.168.0.124.45611: Flags [P.], seq 1:209, ...
10:19:34.636289 IP 192.168.0.124.45611 > 192.168.0.10.22: Flags [.], ack 209, ...
10:19:34.873060 IP 192.168.0.10.22 > 192.168.0.124.45611: Flags [P.], seq 209:417, ...
3 packets captured
# Enregistrer pour Wireshark, puis relire
$ sudo tcpdump -i enp0s3 -w /tmp/capture.pcap -c 10000 host 192.168.0.124
$ tcpdump -nn -r /tmp/capture.pcap | head
```

*Lignes de paquets abrégées.*

| Filtre ou option | Effet |
|:--|:--|
| `-i enp0s3` / `-i any` | Interface à écouter (`any` : toutes) |
| `-nn` | Ne résoudre ni les noms d'hôtes ni les ports (plus rapide, plus clair) |
| `-c 100` | S'arrêter après 100 paquets |
| `host 10.0.0.5` | Trafic vers ou depuis cet hôte (`src host` / `dst host` pour un sens) |
| `port 443` / `portrange 8000-8100` | Filtrer par port |
| `tcp`, `udp`, `icmp` | Filtrer par protocole |
| `and`, `or`, `not` | Combiner : `'tcp and port 443 and not host 10.0.0.5'` |

> [!CAUTION] Données sensibles
> Une capture peut contenir des mots de passe, des cookies ou des données personnelles en clair. Ne capturez que
> sur les systèmes que vous administrez, **avec autorisation**, limitez la capture au strict nécessaire et
> supprimez les fichiers `.pcap` après analyse.
