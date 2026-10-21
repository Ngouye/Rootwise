| Vérification | Pourquoi |
|:--|:--|
| **Privilèges suffisants** | La plupart des modifications exigent root (`sudo`). Un utilisateur standard ne peut pas modifier un autre compte. |
| **Le compte existe** | `usermod` modifie un compte existant ; il n'en crée jamais (`useradd` sert à cela). |
| **Aucune session active** | Pour `-l`, `-u`, `-d -m`, modifier un compte en cours d'utilisation peut échouer ou laisser un état instable : déconnectez l'utilisateur et arrêtez ses processus. |
| **Compte local** | Les comptes LDAP, Active Directory (via SSSD) ou systemd-homed ne sont pas dans `/etc/passwd` : utilisez vos outils d'annuaire ou `homectl`. |

```bash title="bash"
# Le compte existe-t-il, et d'où vient-il ?
$ getent passwd alice
alice:x:1001:1001:Alice Martin:/home/alice:/bin/bash
$ grep '^alice:' /etc/passwd             # vide si le compte vient de LDAP/SSSD
# L'utilisateur a-t-il des processus en cours ?
$ pgrep -u alice -l
```
