| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `iproute2` (Debian/Ubuntu) · `iproute` (RHEL/Fedora) | Utilisateur (root pour voir tous les processus) | 🟢 Recommandé |

`ss` (*socket statistics*) interroge directement le noyau pour lister les sockets. Il affiche des informations
similaires à `netstat`, mais **plus rapidement** sur les serveurs chargés, et donne davantage de détails sur l'état
des connexions TCP (minuteurs, mémoire, fenêtre de congestion).

```bash title="bash"
# Ports TCP en écoute, sortie numérique
$ ss -tln
State    Recv-Q   Send-Q     Local Address:Port      Peer Address:Port
LISTEN   0        128              0.0.0.0:22             0.0.0.0:*
LISTEN   0        80             127.0.0.1:3306           0.0.0.0:*
LISTEN   0        511                    *:80                   *:*
```

```bash title="bash"
# Ports TCP et UDP en écoute, avec les processus
$ sudo ss -tulpn
# Toutes les sockets TCP (en écoute et établies)
$ ss -ta
# Connexions TCP avec leurs minuteurs
$ ss -to
# Résumé statistique de toutes les sockets
$ ss -s
```

## Filtrer avec précision

`ss` intègre un langage de filtrage par état et par port, très pratique pour isoler un trafic précis :

```bash title="bash"
# Connexions établies vers des serveurs HTTPS
$ ss -tn state established '( dport = :443 )'
# Qui est connecté à mon serveur SSH ?
$ ss -tn state established '( sport = :22 )'
```

> [!IMPORTANT] Le réflexe à retenir
> `sudo ss -tulpn` répond en une seule ligne à la question la plus fréquente du dépannage : « quel service
> écoute sur quel port, et sur quelle adresse ? ».
