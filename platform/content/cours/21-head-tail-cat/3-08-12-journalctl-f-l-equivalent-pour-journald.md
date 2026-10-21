| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Suivre les services qui écrivent dans journald | Systèmes systemd (Ubuntu, Debian, RHEL, Rocky…) | 🔵 Pratique |

Sur les systèmes récents, de nombreux services écrivent dans le journal de systemd (**journald**) plutôt
que dans des fichiers texte. `journalctl` offre alors exactement les mêmes usages que `tail` :

| Avec tail (fichier texte) | Avec journalctl (journald) |
|:--|:--|
| `tail -n 50 fichier` | `journalctl -n 50` |
| `tail -f fichier` | `journalctl -f` |
| `tail -n 50 -f fichier` | `journalctl -n 50 -f` |
| `tail -f /var/log/nginx/error.log` | `journalctl -u nginx -f` |

```bash title="bash"
# Suivre le journal du service nginx
$ sudo journalctl -u nginx -f
# 50 dernières entrées de SSH, puis suivi (ssh sur Debian/Ubuntu, sshd sur RHEL)
$ sudo journalctl -u ssh -n 50 -f
# Uniquement les erreurs des 10 dernières minutes
$ sudo journalctl -p err --since '10 min ago'
```

> [!NOTE] Fichiers ou journald ?
> Si `/var/log/<service>.log` n'existe pas ou reste vide, le service écrit probablement dans journald :
> `systemctl status <service>` affiche d'ailleurs ses dernières lignes de journal.
