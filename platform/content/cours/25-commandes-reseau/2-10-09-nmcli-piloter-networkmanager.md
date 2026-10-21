| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `network-manager` (Debian/Ubuntu) · `NetworkManager` (RHEL/Fedora) | Lecture : utilisateur · Modification : root | 🟢 Recommandé |

`nmcli` est l'interface en ligne de commande de **NetworkManager**, le service de gestion réseau utilisé par
défaut sur RHEL, Fedora, Rocky Linux, AlmaLinux et la plupart des postes de travail. Simple à utiliser et facile à
scripter, il permet de consulter l'état du réseau, de créer et modifier des connexions et de gérer le Wi-Fi.
Contrairement à `ip`, **les modifications sont persistantes**.

```bash title="bash"
# État des périphériques réseau
$ nmcli device status
DEVICE   TYPE      STATE         CONNECTION
enp1s0   ethernet  connected     Wired connection 1
wlp2s0   wifi      disconnected  --
# Toutes les connexions (profils), puis seulement les actives
$ nmcli connection show
$ nmcli connection show --active
```

## Configurer une adresse IP statique

```bash title="bash"
$ sudo nmcli connection modify "Wired connection 1" \
    ipv4.method manual \
    ipv4.addresses 192.168.1.50/24 \
    ipv4.gateway 192.168.1.1 \
    ipv4.dns "1.1.1.1 9.9.9.9"
# Appliquer la nouvelle configuration
$ sudo nmcli connection up "Wired connection 1"
```

## Gérer le Wi-Fi

```bash title="bash"
$ nmcli device wifi list
$ sudo nmcli device wifi connect "MonReseau" password "MotDePasse"
```

> [!TIP] Astuce
> Les mots-clés s'abrègent (`nmcli d s` pour `nmcli device status`) et la touche **Tab** complète les noms de
> connexions et de paramètres. `nmcli device show enp1s0` affiche d'un coup l'adresse, la passerelle et les DNS
> d'une interface.
