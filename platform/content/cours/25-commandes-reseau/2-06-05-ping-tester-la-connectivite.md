| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `iputils-ping` (Debian/Ubuntu) · `iputils` (RHEL/Fedora) | Utilisateur | 🔵 Actif |

`ping` (*Packet Internet Groper*) vérifie qu'un hôte est joignable, sur un réseau local (LAN) comme sur un
réseau étendu (WAN). Il envoie des requêtes **ICMP Echo Request** et mesure le temps d'aller-retour (**RTT**) ainsi
que le taux de perte. C'est le test de connectivité le plus élémentaire : il suffit de lui fournir une adresse IP
ou un nom d'hôte.

![Un cycle de ping : srv01 (192.168.1.24) envoie un ICMP Echo Request (type 8, icmp_seq=1) à la passerelle 192.168.1.1, qui répond par un ICMP Echo Reply (type 0, ttl=64) ; le temps d'aller-retour, RTT, vaut 0,4 ms](images/figure-02.webp "Figure 2 — Une requête ICMP Echo et sa réponse : le délai entre les deux est le RTT.")

```bash title="bash"
# Envoyer 4 paquets puis s'arrêter
$ ping -c 4 192.168.1.1
PING 192.168.1.1 (192.168.1.1) 56(84) bytes of data.
64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=0.412 ms
64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=0.388 ms
64 bytes from 192.168.1.1: icmp_seq=3 ttl=64 time=0.405 ms
64 bytes from 192.168.1.1: icmp_seq=4 ttl=64 time=0.397 ms

--- 192.168.1.1 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3052ms
rtt min/avg/max/mdev = 0.388/0.400/0.412/0.009 ms
```

| Option | Effet |
|:--|:--|
| `-c <n>` | Nombre de paquets à envoyer avant de s'arrêter |
| `-i <s>` | Intervalle entre deux paquets (1 seconde par défaut) |
| `-s <octets>` | Taille des données envoyées (tests de MTU et de fragmentation) |
| `-W <s>` | Délai d'attente maximal d'une réponse |
| `-I <interface>` | Interface ou adresse source à utiliser |
| `-4` / `-6` | Forcer IPv4 ou IPv6 |
| `-q` | Mode silencieux : seul le résumé final est affiché |

> [!TIP] Bon à savoir
> Sans l'option `-c`, `ping` s'exécute en continu : interrompez-le avec **Ctrl+C**. Une absence de réponse ne
> prouve pas que l'hôte est hors ligne : de nombreux pare-feu bloquent volontairement l'ICMP.
