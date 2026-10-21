| 🎯 Objectif | 📁 Fichiers modifiés | 🚦 Risque |
|:--|:--|:--|
| Révoquer un accès sans toucher aux autres | `/etc/group`, `/etc/gshadow` | 🟢 Faible |

Les versions récentes de shadow-utils permettent de retirer un groupe précis avec `-r` combiné à `-G`, sans
réécrire toute la liste :

```bash title="bash"
$ sudo usermod -rG docker alice
$ id -nG alice
editeurs sudo
# Alternative universelle (y compris sur les versions plus anciennes)
$ sudo gpasswd -d alice docker
Removing user alice from group docker
```

> [!WARNING] Révocation effective
> Une session déjà ouverte **conserve l'ancien groupe**. Pour qu'une révocation (Docker, sudo…) prenne effet
> immédiatement, fermez les sessions de l'utilisateur : `sudo loginctl terminate-user alice`. Si
> `usermod -rG` est refusé sur votre version, utilisez `gpasswd -d`.
