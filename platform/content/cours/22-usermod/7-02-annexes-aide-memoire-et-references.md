Ces annexes rassemblent les informations à garder sous la main : aide-mémoire par besoin, messages d'erreur,
différences entre distributions, outils voisins et glossaire.

## A. Aide-mémoire : « Je veux… »

| Je veux… | Commande |
|:--|:--|
| Ajouter alice au groupe docker | `sudo usermod -aG docker alice` |
| Retirer alice du groupe docker | `sudo gpasswd -d alice docker` |
| Donner les droits sudo (Debian/Ubuntu) | `sudo usermod -aG sudo alice` |
| Donner les droits sudo (RHEL/Rocky) | `sudo usermod -aG wheel alice` |
| Interdire la connexion interactive | `sudo usermod -s /usr/sbin/nologin svc` |
| Faire expirer un compte le 31/12 | `sudo usermod -e 2026-12-31 alice` |
| Neutraliser un compte | `sudo usermod -L -e 1 alice` |
| Réactiver un compte | `sudo usermod -U -e "" alice` |
| Déplacer un répertoire personnel | `sudo usermod -d /srv/alice -m alice` |
| Renommer un compte et son home | `sudo usermod -l bob -d /home/bob -m alice` |
| Changer l'UID | `sudo usermod -u 1500 alice` |
| Vérifier un compte | `id alice ; getent passwd alice ; sudo chage -l alice` |

## B. Messages d'erreur courants

| Message | Cause et solution |
|:--|:--|
| `user 'x' does not exist` | Faute de frappe, ou compte fourni par LDAP/SSSD et absent de la base locale |
| `user x is currently used by process 1234` | Déconnecter l'utilisateur : `sudo loginctl terminate-user x` ou `sudo pkill -u x` |
| `group 'y' does not exist` | Créer le groupe d'abord : `sudo groupadd y` |
| `UID '1500' already exists` | Choisir un UID libre (ou `-o` si un doublon est réellement voulu) |
| `directory /srv/jack exists` | `-m` refuse de fusionner : déplacer ou renommer d'abord la destination |
| `cannot lock /etc/passwd; try again later.` | Un autre outil de gestion de comptes travaille, ou un fichier `/etc/passwd.lock` est resté après un incident |
| `no changes` | Toutes les valeurs fournies correspondent déjà à la configuration actuelle |

## C. Différences entre distributions

| Élément | Debian / Ubuntu | RHEL / Rocky / Alma |
|:--|:--|:--|
| Groupe administrateur | `sudo` | `wheel` |
| Shell de refus | `/usr/sbin/nologin` | `/sbin/nologin` |
| Hachage par défaut | yescrypt (`$y$`) | SHA-512 (`$6$`) |
| Module de sécurité | AppArmor | SELinux (`-Z`, `restorecon`) |
| Retirer un groupe | `usermod -rG` (versions récentes) | `gpasswd -d` (universel) |

## D. Outils voisins

| Commande | Rôle |
|:--|:--|
| `useradd` / `userdel` | Créer / supprimer un compte |
| `groupadd` / `groupmod` / `groupdel` | Créer, modifier, supprimer un groupe |
| `gpasswd` | Administrer les membres d'un groupe (`-a`, `-d`) |
| `passwd` | Changer un mot de passe ; `-S` état, `-e` forcer le changement |
| `chpasswd` | Définir des mots de passe en lot depuis l'entrée standard |
| `chage` | Politique de vieillissement des mots de passe |
| `chsh` / `chfn` | Changer son shell / ses informations GECOS |
| `id` / `getent` | Afficher l'identité et les groupes / interroger les bases de comptes |
| `pwck` / `grpck` | Vérifier la cohérence des bases d'utilisateurs et de groupes |
| `vipw` / `vigr` | Éditer passwd / group en toute sécurité (avec verrouillage) |
| `homectl` | Gérer les comptes systemd-homed |

## E. Glossaire

| Terme | Définition |
|:--|:--|
| **UID / GID** | Identifiants numériques d'un utilisateur et d'un groupe ; la propriété des fichiers repose sur eux |
| **Groupe principal** | Groupe attribué par défaut aux fichiers créés par l'utilisateur (champ 4 de `/etc/passwd`) |
| **Groupe secondaire** | Groupe supplémentaire donnant accès à des ressources (sudo, docker…) |
| **GECOS** | Champ de commentaire de `/etc/passwd` : nom complet, coordonnées |
| **Hachage** | Empreinte irréversible d'un mot de passe stockée dans `/etc/shadow` |
| **Expiration du compte** | Date après laquelle le compte devient inutilisable (`usermod -e`) |
| **Délai d'inactivité** | Jours de grâce après l'expiration du mot de passe (`usermod -f`) |
| **ID subordonnés** | Plages d'UID/GID réservées à un utilisateur pour ses conteneurs sans root |
| **NSS / getent** | Mécanisme qui réunit les sources de comptes (fichiers, LDAP, SSSD) ; `getent` l'interroge |
| **SELinux** | Module de sécurité à contrôle d'accès obligatoire, actif par défaut sur la famille Red Hat |

## F. Sources et références

- Babin Lonston, « Commande usermod : gérer les utilisateurs, les groupes, les UID, les shells et plus encore
  sous Linux », *Tecmint* (tecmint.com), mis à jour le 2 septembre 2026. Article dont ce guide reprend le plan
  et qu'il enrichit.
- Pages de manuel Linux : `usermod(8)`, `useradd(8)`, `gpasswd(1)`, `chage(1)`, `passwd(1)`, `chpasswd(8)`,
  `pwck(8)`, `grpck(8)`, `login.defs(5)`, `subuid(5)`.
- Projet shadow-utils (github.com/shadow-maint/shadow) ; documentation Red Hat Enterprise Linux sur la
  gestion des utilisateurs et SELinux.
