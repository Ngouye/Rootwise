![Partie 02](images/p18-bandeau-partie.webp)

Une fois la connectivité établie, il faut savoir **quels services écoutent**, quelles connexions sont ouvertes et
**quels ports sont accessibles**. Ces outils sont au cœur du débogage des services réseau et des audits de
sécurité.

![Ports et services, deux points de vue sur srv02 (192.168.1.30) : la vue interne (ss -tulpn, netstat -tulpn) montre quels services écoutent — 22/tcp ssh, 80/tcp http, 443/tcp https, et 3306/tcp mysql sur 127.0.0.1 seulement ; la vue externe (nmap, nc -zv) montre quels ports sont accessibles : 22, 80 et 443, mais pas 3306](images/p18-illustration-3.webp "Ports et services : deux points de vue")

| Fiche | Commande | Rôle |
|:-:|:--|:--|
| 10 | `netstat` | Connexions, ports et statistiques |
| 11 | `ss` | Statistiques des sockets |
| 12 | `nc` (netcat) | Tester des ports, transférer des données |
| 13 | `nmap` | Découverte d'hôtes et scan de ports |
