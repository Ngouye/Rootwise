| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `net-tools` | Utilisateur (root pour voir tous les processus) | 🟠 Obsolète |

`netstat` affiche des informations sur le sous-système réseau de Linux : connexions actives, ports en écoute,
table de routage, statistiques par interface et par protocole. Il a longtemps été l'outil de base pour le
dépannage et l'analyse des performances, en particulier pour vérifier **quel programme écoute sur quel port**.

```bash title="bash"
# Ports TCP/UDP en écoute, numériques, avec le programme associé
$ sudo netstat -tulpn
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address      Foreign Address    State    PID/Program name
tcp        0      0 0.0.0.0:22         0.0.0.0:*          LISTEN   972/sshd
tcp        0      0 127.0.0.1:3306     0.0.0.0:*          LISTEN   1053/mysqld
tcp6       0      0 :::80              :::*               LISTEN   990/httpd
udp        0      0 0.0.0.0:68         0.0.0.0:*                   811/dhclient
```

| Option | Effet |
|:--|:--|
| `-t` / `-u` | Afficher les connexions TCP / UDP |
| `-l` | Afficher uniquement les sockets en écoute |
| `-p` | Afficher le PID et le nom du programme (root requis pour tous les voir) |
| `-n` | Adresses et ports numériques, sans résolution de noms |
| `-r` | Table de routage du noyau (équivalent de `route -n`) |
| `-i` | Statistiques par interface |
| `-s` | Statistiques par protocole (IP, ICMP, TCP, UDP) |

> [!WARNING] Outil obsolète
> Comme `ifconfig` et `route`, `netstat` fait partie de `net-tools`. Son remplaçant moderne est `ss` (fiche 11),
> plus rapide et plus précis, dont les options principales sont identiques.
