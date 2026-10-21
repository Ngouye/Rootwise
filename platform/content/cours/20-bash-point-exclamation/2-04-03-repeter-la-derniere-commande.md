| 🎯 Objectif | 🖥️ Contexte | 📶 Niveau |
|:--|:--|:--|
| Relancer, compléter ou élever les privilèges | Terminal interactif | 🟢 Essentiel |

`!!` se développe en la commande précédente entière. Son usage le plus célèbre : relancer avec `sudo`
une commande refusée faute de privilèges.

```bash title="bash"
$ systemctl restart nginx
Failed to restart nginx.service: Access denied
See system logs and 'systemctl status nginx.service' for details.
$ sudo !!
sudo systemctl restart nginx
```

Comme `!!` reprend toute la ligne, on peut la compléter, par exemple avec une redirection :

```bash title="bash"
$ ip -4 -o addr show | awk '{print $4}' | cut -d/ -f1
127.0.0.1
192.168.0.10
$ !! > ip.txt
ip -4 -o addr show | awk '{print $4}' | cut -d/ -f1 > ip.txt
```

Sans `sudo`, avec `su` : les guillemets doubles sont indispensables, car l'expansion d'historique n'a
pas lieu entre guillemets simples.

```bash title="bash"
$ su -c "!!" root
su -c "systemctl restart nginx" root
Password:
```

> [!WARNING] `sudo` n'est pas une solution universelle
> `sudo !!` ne corrige que les erreurs de **droits**. Si Bash répond « command not found » — par exemple
> pour `ifconfig` —, c'est le **paquet** qui manque : `sudo apt install net-tools` (Debian, Ubuntu) ou
> `sudo dnf install net-tools` (RHEL, Rocky Linux, Fedora). Mieux encore : utilisez la commande moderne
> `ip addr`.
