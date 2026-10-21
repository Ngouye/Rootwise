| 🎯 Objectif | 📁 Fichiers modifiés | 🚦 Risque |
|:--|:--|:--|
| Choisir le shell ou bloquer l'accès interactif | `/etc/passwd` (champ 7) | 🟡 Modéré |

L'option `-s` définit le programme lancé à la connexion. Son usage le plus courant n'est pas de passer de
Bash à Zsh, mais de **supprimer l'accès interactif** d'un compte de service :

```bash title="bash"
# Vérifier que le shell existe avant de l'attribuer
$ ls -l /usr/sbin/nologin
$ sudo usermod -s /usr/sbin/nologin backupsvc
$ getent passwd backupsvc
backupsvc:x:998:998:Agent de sauvegarde:/var/lib/backupsvc:/usr/sbin/nologin
```

| Shell | Comportement |
|:--|:--|
| `/usr/sbin/nologin` | Affiche un message poli puis refuse la connexion (chemin Debian/Ubuntu) |
| `/sbin/nologin` | Même rôle sur RHEL, Rocky, AlmaLinux (où `/sbin` pointe vers `/usr/sbin`) |
| `/bin/false` | Se termine silencieusement avec un code d'erreur |
| `/bin/bash`, `/usr/bin/zsh` | Shells interactifs habituels |

> [!WARNING] Limites
> Contrairement à `chsh`, `usermod` n'exige pas que le shell figure dans `/etc/shells`. Et un shell
> `nologin` ne bloque pas forcément tout : la redirection de ports SSH ou SFTP peut nécessiter des
> restrictions supplémentaires dans `sshd_config`.
