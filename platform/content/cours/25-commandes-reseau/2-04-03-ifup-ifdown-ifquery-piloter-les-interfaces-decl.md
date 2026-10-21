| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `ifupdown` (Debian/Ubuntu) | root (`sudo`) | ⚪ Selon distribution |

Ces trois commandes s'appuient sur la configuration déclarée dans le fichier `/etc/network/interfaces` (Debian
et dérivés). Contrairement à `ip link set`, elles appliquent **l'ensemble de la configuration** de l'interface :
adressage, passerelle, routes et scripts associés.

| Commande | Rôle |
|:--|:--|
| `ifup` | Active l'interface et applique sa configuration : elle peut alors émettre et recevoir des données |
| `ifdown` | Désactive l'interface : elle ne transmet ni ne reçoit plus aucune donnée |
| `ifquery` | Analyse et affiche la configuration déclarée d'une interface ou son état courant |

```bash title="bash"
$ sudo ifup eth0
$ sudo ifdown eth0
# Configuration déclarée pour eth0
$ ifquery eth0
# Interfaces actuellement activées par ifupdown
$ ifquery --state
```

Exemple de déclaration d'une adresse statique dans `/etc/network/interfaces` :

```ini title="/etc/network/interfaces"
# Interface activée automatiquement au démarrage
auto eth0
iface eth0 inet static
    address 192.168.1.50/24
    gateway 192.168.1.1
```

> [!NOTE] Selon la distribution
> Sur Ubuntu (Netplan) et sur les distributions Red Hat récentes (NetworkManager), ces commandes peuvent être
> absentes ou n'être que des enveloppes autour de NetworkManager. Utilisez alors `nmcli connection up` et
> `nmcli connection down` (fiche 09).
