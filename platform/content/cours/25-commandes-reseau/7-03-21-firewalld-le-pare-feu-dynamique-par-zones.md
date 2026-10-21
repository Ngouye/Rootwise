| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `firewalld` | root (`sudo`) | 🔵 Actif |

`firewalld` est un démon de gestion dynamique du pare-feu Netfilter, administré avec la commande
`firewall-cmd`. Au lieu des chaînes d'iptables, il raisonne en **zones** (public, home, internal, trusted, drop…)
auxquelles on associe interfaces, services et ports. Les règles se modifient **à chaud**, sans interrompre les
connexions établies. C'est le pare-feu par défaut de RHEL, Fedora, Rocky Linux et AlmaLinux ; il s'appuie sur
nftables dans les versions récentes.

```bash title="bash"
$ sudo firewall-cmd --state
running
$ sudo firewall-cmd --get-active-zones
public
  interfaces: enp1s0
# Tout ce qui est autorisé dans la zone par défaut
$ sudo firewall-cmd --list-all
```

## Ouvrir des services et des ports

```bash title="bash"
# Autoriser HTTPS et le port 8080 de façon permanente, puis recharger
$ sudo firewall-cmd --zone=public --add-service=https --permanent
$ sudo firewall-cmd --zone=public --add-port=8080/tcp --permanent
$ sudo firewall-cmd --reload
# Retirer un service
$ sudo firewall-cmd --zone=public --remove-service=http --permanent
# Règle riche : SSH autorisé uniquement depuis le réseau local
$ RULE='rule family="ipv4" source address="192.168.1.0/24" service name="ssh" accept'
$ sudo firewall-cmd --permanent --add-rich-rule="$RULE"
```

> [!NOTE] Runtime ou permanent ?
> Sans `--permanent`, une modification s'applique immédiatement mais disparaît au prochain rechargement. Avec
> `--permanent`, elle est enregistrée mais ne s'applique qu'après `--reload`. Astuce : testez sans
> `--permanent`, puis validez avec `sudo firewall-cmd --runtime-to-permanent`.

> [!WARNING] Un seul gestionnaire
> N'utilisez pas firewalld et le service iptables en même temps sur un même serveur : choisissez l'un ou l'autre.
