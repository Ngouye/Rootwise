**Aucun outil ne voit tout.** Les 24 outils de ce cours se répartissent par ressource — processus, disques,
réseau, matériel — et par horizon : ce qui se passe maintenant, ce qui s'est passé cette nuit, et ce qui doit
vous réveiller.

![Le serveur Linux au centre de cinq familles d'outils : processus, CPU, mémoire (fiches 01 à 05 : top, htop, atop, btop, vmstat) ; réseau (09 à 14 : ss, tcpdump, iftop, nethogs, iptraf-ng, vnstat) ; disques et fichiers (06 à 08 : iostat, iotop, lsof) ; vue d'ensemble et matériel (15 à 18 : nmon, collectl, s-tui, psacct) ; supervision et sécurité (19 à 24 : monit, monitorix, netdata, nagios, arpwatch, suricata)](images/figure-01.webp "Figure 1 — La carte des 24 outils, classés par ressource surveillée.")

> [!TIP] La méthode USE
> Pour chaque ressource (CPU, mémoire, disque, réseau), posez trois questions : quelle est son **U**tilisation
> (taux d'occupation), est-elle **S**aturée (file d'attente, processus qui patientent) et produit-elle des
> **E**rreurs ? Cette méthode, formalisée par Brendan Gregg, évite de chercher au hasard.

## Les 24 outils du cours

| N° | Outil | Ce qu'il surveille | Type |
|:-:|:--|:--|:--|
| 01 | `top` | Processus, CPU, mémoire, charge — toujours disponible | 🖥️ Terminal |
| 02 | `htop` | Processus en couleur, interactif, arborescence | 🖥️ Terminal |
| 03 | `atop` | Toutes les ressources par processus, avec historique | 🖥️ Terminal |
| 04 | `btop` | Processus et ressources avec graphiques modernes | 🖥️ Terminal |
| 05 | `vmstat` | Mémoire virtuelle, file d'exécution, swap, E/S, CPU | 🖥️ Terminal |
| 06 | `iostat` | Débit, latence et saturation des périphériques | 🖥️ Terminal |
| 07 | `iotop` | Lectures et écritures disque par processus | 🖥️ Terminal |
| 08 | `lsof` | Fichiers, sockets et périphériques ouverts | 🖥️ Terminal |
| 09 | `ss` (netstat) | Sockets, ports à l'écoute, connexions | 🖥️ Terminal |
| 10 | `tcpdump` | Capture et filtrage des paquets | 🖥️ Terminal |
| 11 | `iftop` | Bande passante par couple d'hôtes | 🖥️ Terminal |
| 12 | `nethogs` | Bande passante par processus | 🖥️ Terminal |
| 13 | `iptraf-ng` | Trafic IP et statistiques d'interface | 🖥️ Terminal |
| 14 | `vnstat` | Historique du trafic par heure, jour, mois | ⚙️ Service |
| 15 | `nmon` | Vue d'ensemble interactive et capture CSV | 🖥️ Terminal |
| 16 | `collectl` | Collecte multi-ressources en continu | 🖥️ Terminal |
| 17 | `s-tui` | Fréquence, température, puissance du processeur | 🖥️ Terminal |
| 18 | `psacct` / `acct` | Activité et commandes des utilisateurs | ⚙️ Service |
| 19 | Monit | Processus et services, redémarrage automatique | ⚙️ Service |
| 20 | Monitorix | Graphiques système et réseau dans le navigateur | 🌐 Web |
| 21 | Netdata | Tableau de bord temps réel, des milliers de métriques | 🌐 Web |
| 22 | Nagios | Supervision de parc avec alertes | 🌐 Web |
| 23 | `arpwatch` | Couples IP / MAC, usurpation ARP | ⚙️ Service |
| 24 | Suricata | Détection et prévention d'intrusions réseau | ⚙️ Service |

🖥️ **Terminal** : interactif ou en ligne de commande · ⚙️ **Service** : collecte en arrière-plan · 🌐 **Web** :
tableau de bord dans le navigateur
