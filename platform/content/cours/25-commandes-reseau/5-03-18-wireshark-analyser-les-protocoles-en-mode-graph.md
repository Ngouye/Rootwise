| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `wireshark` · `tshark` (Debian/Ubuntu) · `wireshark-cli` (RHEL) | Groupe `wireshark` ou root pour capturer | 🔵 Actif |

**Wireshark** est un analyseur de protocoles graphique, populaire, puissant et facile à prendre en main. Il capture
le trafic en temps réel ou ouvre des fichiers pcap (produits par exemple par `tcpdump`), puis **décode chaque
paquet couche par couche**. Administrateurs et ingénieurs réseau l'utilisent pour le dépannage, l'analyse de
performances et les investigations de sécurité.

## Fonctionnalités clés

- Décodage détaillé de chaque paquet, couche par couche (Ethernet, IP, TCP, HTTP…) ;
- Filtres d'affichage puissants pour isoler un flux précis ;
- « Suivre le flux TCP » pour reconstituer une conversation complète ;
- Statistiques : conversations, hiérarchie des protocoles, graphiques d'entrées/sorties ;
- Enregistrement et export des captures dans de nombreux formats.

## Filtres d'affichage utiles

| Filtre | Affiche |
|:--|:--|
| `ip.addr == 192.168.1.10` | Les paquets impliquant cette adresse |
| `tcp.port == 443` | Le trafic sur le port 443 |
| `dns` | Uniquement le trafic DNS |
| `http.request` | Les requêtes HTTP |
| `tcp.analysis.retransmission` | Les retransmissions TCP (signe de pertes) |
| `tcp.flags.reset == 1` | Les connexions réinitialisées (RST) |

## tshark : Wireshark en ligne de commande

```bash title="bash"
# Capturer et afficher le trafic DNS
$ sudo tshark -i enp1s0 -f "port 53"
# Analyser un fichier pcap avec un filtre d'affichage
$ tshark -r capture.pcap -Y "tcp.analysis.retransmission"
# Capturer sans être root (puis se reconnecter)
$ sudo usermod -aG wireshark $USER
```

> [!TIP] Méthode efficace
> Sur un serveur sans interface graphique, capturez avec `tcpdump -w`, rapatriez le fichier `.pcap` sur votre
> poste, puis analysez-le confortablement dans Wireshark.
