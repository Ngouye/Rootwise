| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `iptables` (Debian/Ubuntu) · `iptables-nft` (RHEL/Fedora) | root (`sudo`) | 🟠 Hérité |

`iptables` permet de configurer, gérer et inspecter les tables de filtrage de paquets IPv4 et les règles NAT de
Netfilter. Les règles sont organisées en **tables** (filter, nat, mangle) et en **chaînes** (INPUT, OUTPUT,
FORWARD). On peut lister, ajouter, supprimer ou modifier des règles et consulter les compteurs associés à chacune.

## Exemple : politique de base pour un serveur web

```bash title="bash"
# 1. Autoriser le trafic de retour et la boucle locale
$ sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
$ sudo iptables -A INPUT -i lo -j ACCEPT
# 2. Autoriser SSH, HTTP et HTTPS
$ sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
$ sudo iptables -A INPUT -p tcp -m multiport --dports 80,443 -j ACCEPT
# 3. Refuser tout le reste en entrée (politique par défaut)
$ sudo iptables -P INPUT DROP
# 4. Vérifier : règles avec compteurs et numéros de ligne
$ sudo iptables -L -n -v --line-numbers
```

| Option | Effet |
|:--|:--|
| `-A` / `-I <chaîne>` | Ajouter une règle en fin / en début de chaîne |
| `-D <chaîne> <n>` | Supprimer la règle numéro n |
| `-P <chaîne> <cible>` | Définir la politique par défaut (ACCEPT ou DROP) |
| `-p` / `--dport` · `-s` | Protocole, port de destination, adresse source |
| `-j <cible>` | Action : ACCEPT, DROP, REJECT, LOG… |

## Sauvegarder et restaurer

```bash title="bash"
$ sudo iptables-save | sudo tee /etc/iptables/rules.v4
$ sudo iptables-restore < /etc/iptables/rules.v4
# Debian/Ubuntu : rechargement automatique au démarrage
$ sudo apt install iptables-persistent
```

> [!CAUTION] Administration à distance
> Avant d'appliquer `-P INPUT DROP` sur un serveur distant, vérifiez que la règle autorisant SSH est en place,
> **sinon vous perdrez l'accès**. Gardez toujours une seconde session ouverte pendant vos tests.
