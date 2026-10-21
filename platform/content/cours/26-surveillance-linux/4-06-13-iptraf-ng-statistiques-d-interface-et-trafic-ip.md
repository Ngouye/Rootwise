| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Décomposer le trafic par interface, protocole et port | `iptraf-ng` | 🖥️ Terminal |

`iptraf-ng` est un moniteur réseau en mode console, **à menus**. Il présente le trafic IP en temps réel, les
indicateurs TCP, les détails ICMP, la répartition TCP/UDP par port, les compteurs d'erreurs et les statistiques de
chaque interface. Il remplace l'ancien IPTraf, qui n'est plus maintenu.

```bash title="bash"
$ sudo apt install iptraf-ng       # ou : sudo dnf install iptraf-ng
$ sudo iptraf-ng                   # menu principal
# Accès direct aux différents écrans
$ sudo iptraf-ng -i enp0s3         # moniteur de trafic IP (connexions, indicateurs TCP)
$ sudo iptraf-ng -g                # statistiques générales de toutes les interfaces
$ sudo iptraf-ng -d enp0s3         # statistiques détaillées d'une interface
$ sudo iptraf-ng -s enp0s3         # répartition du trafic par service (port)
# Journaliser en arrière-plan pendant 60 minutes
$ sudo iptraf-ng -i enp0s3 -t 60 -B -L /var/log/iptraf-web01.log
```

| Écran | Utilité |
|:--|:--|
| **IP traffic monitor** | Connexions TCP en cours, volumes, indicateurs (SYN, ACK, FIN…) |
| **General interface statistics** | Paquets IP, non-IP et erreurs pour chaque interface |
| **Detailed interface statistics** | Détail par protocole et débit d'une interface |
| **Statistical breakdowns** | Répartition par taille de paquet ou par port TCP/UDP |
| **LAN station monitor** | Trafic par adresse MAC sur le réseau local |
