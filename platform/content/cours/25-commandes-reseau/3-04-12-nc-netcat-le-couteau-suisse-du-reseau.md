| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `netcat-openbsd` (Debian/Ubuntu) · `nmap-ncat` (RHEL/Fedora) | Utilisateur (root pour les ports < 1024) | 🔵 Actif |

`nc` (**netcat**) lit et écrit des données à travers des connexions TCP, UDP ou des sockets UNIX. Il permet
d'ouvrir une connexion, d'écouter sur un port, de vérifier l'accessibilité d'un service distant, de scanner
quelques ports, de servir de relais TCP simple ou encore de transférer des fichiers entre deux machines.

## Tester des ports distants

```bash title="bash"
# -z : sonder sans envoyer de données · -v : mode verbeux
$ nc -zv srv02.example.lan 22 80 443
Connection to srv02.example.lan 22 port [tcp/ssh] succeeded!
Connection to srv02.example.lan 80 port [tcp/http] succeeded!
nc: connect to srv02.example.lan port 443 (tcp) failed: Connection refused
# Une plage de ports
$ nc -zv srv02.example.lan 20-90
# Port source 3000, délai d'attente de 10 s, vers le port 5000
$ nc -p 3000 -w 10 srv02.example.lan 5000
```

## Transférer un fichier

```bash title="bash"
# Machine réceptrice : écouter sur le port 5000
$ nc -l 5000 > sauvegarde.tar.gz
# Machine émettrice : envoyer le fichier
# (-N ferme la connexion en fin de fichier, variante OpenBSD)
$ nc -N srv02.example.lan 5000 < sauvegarde.tar.gz
```

> [!WARNING] Attention
> Les variantes de netcat (OpenBSD, traditionnelle, ncat de Nmap) n'ont pas exactement les mêmes options :
> vérifiez avec `man nc`. Netcat transmet les données **en clair** : pour des données sensibles, préférez `scp`
> ou `rsync` sur SSH.
