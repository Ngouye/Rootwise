| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `ufw` | root (`sudo`) | 🔵 Actif |

**UFW** (*Uncomplicated Firewall*) est l'outil de configuration de pare-feu par défaut d'Ubuntu, également
disponible sur Debian. Il simplifie l'écriture des règles Netfilter grâce à une **syntaxe lisible** : activer ou
désactiver le pare-feu, ajouter, supprimer, modifier ou réinitialiser des règles devient très accessible.

```bash title="bash"
# Toujours autoriser SSH AVANT d'activer le pare-feu à distance
$ sudo ufw allow OpenSSH
$ sudo ufw allow 443/tcp
$ sudo ufw enable
$ sudo ufw status verbose
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
OpenSSH (v6)               ALLOW IN    Anywhere (v6)
443/tcp (v6)               ALLOW IN    Anywhere (v6)
```

| Commande | Effet |
|:--|:--|
| `sudo ufw allow 80/tcp` | Autoriser un port |
| `sudo ufw deny 23` | Bloquer un port |
| `sudo ufw allow from 192.168.1.0/24 to any port 22` | Autoriser un réseau sur un port précis |
| `sudo ufw limit ssh` | Limiter les tentatives de connexion (anti force brute) |
| `sudo ufw status numbered` | Lister les règles numérotées |
| `sudo ufw delete 3` | Supprimer la règle n° 3 |
| `sudo ufw disable` | Désactiver le pare-feu |
| `sudo ufw reset` | Réinitialiser toutes les règles |

> [!TIP] Politique recommandée
> `sudo ufw default deny incoming` et `sudo ufw default allow outgoing` : tout est bloqué en entrée, sauf ce
> que vous autorisez explicitement.
