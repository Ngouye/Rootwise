`usermod` n'a pas de base de données propre : selon les options, il modifie **directement** les fichiers de
comptes situés dans `/etc`. C'est facile à vérifier… mais une commande erronée s'applique immédiatement.

| Fichier | Contenu |
|:--|:--|
| `/etc/passwd` | Nom, UID, GID principal, commentaire GECOS, répertoire personnel, shell |
| `/etc/shadow` | Hachage du mot de passe, vieillissement du mot de passe et expiration du compte |
| `/etc/group` | Groupes et liste de leurs membres secondaires |
| `/etc/gshadow` | Informations sécurisées des groupes (administrateurs, mots de passe de groupe) |
| `/etc/subuid`, `/etc/subgid` | Plages d'UID/GID subordonnés des conteneurs sans root (Podman, Docker) |
| `/etc/login.defs` | Valeurs par défaut (`UID_MIN`, `SUB_UID_COUNT`…) : lu, mais normalement pas modifié |
| `/etc/selinux/…/seusers` | Correspondances utilisateur Linux → utilisateur SELinux |

> [!NOTE] Souvent oubliés
> Les fichiers `/etc/subuid` et `/etc/subgid` sont absents de nombreux guides anciens. Ils sont pourtant
> essentiels sur les serveurs modernes : Podman sans root, Docker en mode rootless et toutes les charges de
> travail fondées sur les espaces de noms utilisateur en dépendent.
