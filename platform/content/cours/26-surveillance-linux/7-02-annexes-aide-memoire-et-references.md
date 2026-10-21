Ces annexes rassemblent les informations à garder sous la main : aide-mémoire par symptôme, commandes
historiques et leurs remplaçants, fichiers et ports, repères chiffrés et glossaire.

## A. Aide-mémoire : « Je veux savoir… »

| Je veux savoir… | Commande |
|:--|:--|
| Si la machine est surchargée | `uptime ; nproc` |
| Quel processus consomme le CPU | `top` (touche **P**) ou `pidstat 1` |
| Quel processus consomme la mémoire | `top` (touche **M**) ou `htop` |
| S'il manque de la mémoire | `free -h ; vmstat 1` (`si`, `so`) |
| Quel disque est lent | `iostat -xz 1` |
| Quel processus écrit sur le disque | `sudo iotop -oP` |
| Pourquoi le disque est plein | `df -h ; sudo du -xh / \| sort -h ; sudo lsof +L1` |
| Quels ports sont ouverts | `sudo ss -tulpn` |
| Qui utilise la bande passante | `sudo iftop -nP ; sudo nethogs` |
| Ce qui s'est passé cette nuit | `atop -r ; sar -u ; sar -r` |
| Ce qu'a fait un utilisateur | `sudo lastcomm alice` |

## B. Commandes historiques et remplaçants

| Ancien outil | Remplaçant | Remarque |
|:--|:--|:--|
| `netstat` | `ss`, `nstat` | net-tools n'est plus installé par défaut |
| `ifconfig` | `ip addr`, `ip -s link` | Paquet iproute2 |
| `route` | `ip route` | Paquet iproute2 |
| `iptraf` | `iptraf-ng` | IPTraf n'est plus maintenu |
| vnStat PHP | `vnstati`, Netdata | Interface web peu maintenue |
| `iotop` (Python) | `iotop-c` | Réécriture en C, plus légère |
| Nagios seul | Icinga, Zabbix, Prometheus | Alternatives modernes et répandues |

## C. Fichiers, journaux et ports

| Emplacement | Rôle |
|:--|:--|
| `/var/log/atop/` | Enregistrements d'atop (`atop -r`) |
| `/var/log/sysstat/` · `/var/log/sa/` | Historique sar (Debian · RHEL) |
| `/var/lib/vnstat/` | Base de données de vnstat |
| `/var/log/account/pacct` · `/var/account/pacct` | Comptabilité des processus (Debian · RHEL) |
| `/etc/monit/monitrc` · `/etc/monitrc` | Configuration de Monit (Debian · RHEL) ; web : 2812 |
| `/etc/monitorix/monitorix.conf` | Configuration de Monitorix ; web : 8080 |
| `/etc/netdata/netdata.conf` | Configuration de Netdata ; web : 19999 |
| `/etc/nagios4/` · `/etc/nagios/` | Configuration de Nagios (Debian · RHEL) |
| `/etc/suricata/suricata.yaml` | Configuration de Suricata |
| `/var/log/suricata/` | Alertes (`fast.log`) et événements JSON (`eve.json`) |

## D. Repères chiffrés

Ces valeurs sont des **points de départ** pour l'analyse, pas des règles absolues : comparez toujours avec le
comportement habituel de votre serveur.

| Indicateur | À surveiller si… | Piste |
|:--|:--|:--|
| Charge moyenne | Durablement supérieure au nombre de cœurs | CPU saturé ou E/S bloquantes |
| `vmstat` r | Durablement supérieur au nombre de cœurs | File d'exécution, manque de CPU |
| `vmstat` si / so | Différents de 0 de façon continue | Manque de mémoire, swap actif |
| `%wa` (iowait) | Durablement au-delà de 10 à 20 % | Disque ou stockage réseau lent |
| `%st` (steal) | Durablement au-delà de 5 à 10 % | Hyperviseur surchargé (VM) |
| `r_await` / `w_await` | Au-delà de 1 à 2 ms (NVMe), de 10 à 20 ms (HDD) | Stockage saturé ou dégradé |
| `%util` | Proche de 100 % sur un disque mécanique | Disque saturé (peu fiable sur SSD) |
| Mémoire `available` | Moins de 10 % de la mémoire totale | Risque d'OOM killer |
| Retransmissions TCP | Plus de 1 % des segments | Perte de paquets, congestion |

## E. Glossaire

| Terme | Définition |
|:--|:--|
| **Charge moyenne** | Nombre moyen de tâches exécutables ou en attente non interruptible, sur 1, 5 et 15 min |
| **iowait** (`%wa`) | Temps où le CPU est inactif alors que des E/S disque sont en attente |
| **Steal** (`%st`) | Temps CPU « volé » à une machine virtuelle par l'hyperviseur |
| **Swap** | Espace disque utilisé comme extension de la mémoire ; lent |
| **Cache / buffers** | Mémoire utilisée pour accélérer les accès disque, récupérable |
| **IOPS** | Nombre d'opérations d'entrée/sortie par seconde |
| **Latence** (await) | Temps moyen de traitement d'une E/S, file d'attente comprise |
| **Socket** | Extrémité d'une communication réseau (adresse + port) |
| **IDS / IPS** | Système de détection / de prévention d'intrusions |
| **Usurpation ARP** | Attaque où une machine se fait passer pour une autre sur le réseau local |

## F. Sources et références

- Ravi Saive, « 24 des meilleurs outils en ligne de commande pour surveiller les performances Linux », *Tecmint*
  (tecmint.com), mis à jour le 8 septembre 2025. Article dont ce guide reprend la sélection d'outils et qu'il
  corrige et enrichit.
- Brendan Gregg, « Linux Performance Analysis in 60,000 Milliseconds », *Netflix Technology Blog* (2015) ;
  « The USE Method » (brendangregg.com).
- Pages de manuel : `top(1)`, `vmstat(8)`, `iostat(1)`, `sar(1)`, `lsof(8)`, `ss(8)`, `tcpdump(8)`, `iftop(8)`,
  `nethogs(8)`, `vnstat(1)`, `atop(1)`, `lastcomm(1)`.
- Documentation des projets : Netdata (learn.netdata.cloud), Suricata (docs.suricata.io, OISF), Nagios Core,
  Monit (mmonit.com), Monitorix (monitorix.org).
