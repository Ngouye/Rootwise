| 🎯 Objectif | 📁 Fichiers modifiés | 🚦 Risque |
|:--|:--|:--|
| Renseigner le nom complet ou le service | `/etc/passwd` (champ 5) | 🟢 Faible |

L'option `-c` modifie le champ **GECOS**, un texte libre qui contient généralement le nom complet de
l'utilisateur, son service ou des coordonnées. C'est l'une des options les moins intrusives : elle ne touche
ni à l'UID, ni aux groupes, ni au répertoire, ni au shell, ni à l'authentification.

```bash title="bash"
$ sudo usermod -c "Alice Martin, équipe DevOps" alice
$ getent passwd alice
alice:x:1001:1001:Alice Martin, équipe DevOps:/home/alice:/bin/bash
```

Préférez `getent passwd` à une lecture directe de `/etc/passwd` : `getent` interroge toutes les sources de
comptes configurées, y compris LDAP ou SSSD.

> [!TIP] Bon à savoir
> Le GECOS peut contenir des sous-champs séparés par des virgules (nom, bureau, téléphones). N'y mettez jamais
> de deux-points (`:`), qui séparent les champs de `/etc/passwd`. Pour une saisie interactive, `chfn` est une
> alternative.
