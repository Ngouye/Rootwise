| 🎯 Objectif | 📁 Fichiers modifiés | 🚦 Risque |
|:--|:--|:--|
| Changer le nom de connexion | `/etc/passwd`, `/etc/shadow`, `/etc/group` | 🔴 Élevé |

L'option `-l` change le nom de connexion. Elle ne renomme **ni le répertoire personnel, ni le groupe privé,
ni la boîte aux lettres** locale. L'utilisateur doit être entièrement déconnecté : sinon `usermod` refuse avec
« user alice is currently used by process 1234 ».

```bash title="bash"
# 1. Vérifier qu'aucun processus ne tourne sous ce compte
$ pgrep -u alice -l
# 2. Renommer le compte et son répertoire en une seule commande
$ sudo usermod -l alice_admin -d /home/alice_admin -m alice
# 3. Renommer le groupe privé et la boîte aux lettres, si nécessaire
$ sudo groupmod -n alice_admin alice
$ sudo mv /var/mail/alice /var/mail/alice_admin
$ id alice_admin
uid=1001(alice_admin) gid=1001(alice_admin) groups=1001(alice_admin),27(sudo)
```

> [!IMPORTANT] Après un renommage
> Pensez aux références à l'ancien nom : règles sudoers nominatives, `AllowUsers` dans `sshd_config`, tâches
> cron, droits applicatifs. L'UID ne change pas : les fichiers restent bien attribués.
