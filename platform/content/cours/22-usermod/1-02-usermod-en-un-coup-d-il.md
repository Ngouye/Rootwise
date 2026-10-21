Syntaxe : `usermod [options] IDENTIFIANT`. La commande est simple ; la complexité tient à ce que chaque
option modifie, et au fait qu'elle **remplace** ou **ajoute** à la configuration existante.

| Option | Effet | Risque |
|:--|:--|:--|
| `-c`, `--comment` | Modifier le commentaire GECOS (nom complet, service…) | 🟢 Faible |
| `-d`, `--home` | Changer le chemin du répertoire personnel (sans rien déplacer) | 🟡 Modéré |
| `-m`, `--move-home` | Avec `-d` : déplacer aussi le contenu du répertoire | 🟡 Modéré |
| `-e`, `--expiredate` | Date d'expiration du compte (AAAA-MM-JJ) | 🟢 Faible |
| `-f`, `--inactive` | Jours d'inactivité tolérés après expiration du mot de passe | 🟢 Faible |
| `-g`, `--gid` | Changer le groupe principal | 🟡 Modéré |
| `-G`, `--groups` | Définir les groupes secondaires (**remplace** la liste) | 🔴 Élevé |
| `-a`, `--append` | Avec `-G` : ajouter au lieu de remplacer | 🟢 Faible |
| `-r`, `--remove` | Avec `-G` : retirer des groupes (versions récentes) | 🟢 Faible |
| `-l`, `--login` | Renommer le compte | 🔴 Élevé |
| `-L` / `-U` | Verrouiller / déverrouiller le mot de passe | 🟡 Modéré |
| `-p`, `--password` | Écrire un mot de passe déjà haché (jamais en clair) | 🔴 Élevé |
| `-s`, `--shell` | Changer le shell de connexion | 🟡 Modéré |
| `-u`, `--uid` | Changer l'UID numérique | 🔴 Élevé |
| `-o`, `--non-unique` | Avec `-u` : autoriser un UID déjà utilisé | 🔴 Élevé |
| `-v` / `-V`, `-w` / `-W` | Ajouter / retirer des plages d'UID / GID subordonnés | 🟡 Modéré |
| `-Z`, `--selinux-user` | Associer le compte à un utilisateur SELinux | 🟡 Modéré |
| `-R` / `-P` | Travailler dans un chroot / un préfixe (système hors ligne) | 🟡 Modéré |
| `-b`, `--badname` | Accepter un nom hors des règles de nommage | 🟡 Modéré |

🟢 **Faible** : sans effet sur l'accès · 🟡 **Modéré** : à préparer · 🔴 **Élevé** : vérifier avant et après

![usermod au centre de six familles de fichiers : /etc/passwd, identité du compte (-l, -u, -g, -c, -d, -s) ; /etc/shadow, mot de passe et expiration (-p, -L, -U, -e, -f) ; /etc/group et /etc/gshadow, groupes secondaires (-G, -aG, -rG) ; répertoire personnel, déplacement et propriétaire (-d -m, -u, -g) ; /etc/subuid et /etc/subgid, conteneurs sans root (-v, -V, -w, -W) ; SELinux (seusers), utilisateur SELinux (-Z)](images/figure-01.webp "Figure 1 — Les fichiers que usermod modifie, selon l'option utilisée.")

> [!IMPORTANT] La méthode en quatre temps
> **Sauvegarder** les bases de comptes, **vérifier** l'état actuel (`id`, `getent`), **modifier** avec
> `usermod`, puis **contrôler** le résultat et la cohérence des bases (`id`, `chage -l`, `pwck`, `grpck`).
