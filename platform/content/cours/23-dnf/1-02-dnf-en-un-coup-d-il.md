Syntaxe : `dnf [options] commande [arguments]`. À chaque appel, DNF **lit sa configuration**, met à jour si
besoin les **métadonnées des dépôts**, **calcule une transaction** cohérente, puis **confie l'installation à
RPM** — avant d'enregistrer le tout dans son **historique**.

![1. l'administrateur lance sudo dnf install nginx ; dnf (libdnf, libsolv, librepo) calcule et applique la transaction : 2. il lit sa configuration (/etc/dnf/dnf.conf, /etc/yum.repos.d/*.repo), 3. interroge les dépôts baseos, appstream et epel (métadonnées et paquets signés), 4. remplit le cache local (/var/cache/dnf), 5. confie l'installation à RPM (/var/lib/rpm), 6. numérote la transaction dans l'historique (/var/lib/dnf/history.sqlite)](images/figure-01.webp "Figure 1 — Le cheminement d'une commande DNF, de la configuration à l'historique.")

> [!NOTE] DNF ou RPM ?
> `rpm` installe, interroge et vérifie des paquets un par un, sans jamais aller chercher de dépendance. `dnf`
> travaille au niveau des dépôts : il trouve, télécharge et installe tout ce qui est nécessaire, en une
> transaction. Règle pratique : **`dnf` pour installer et mettre à jour**, **`rpm -q…` et `rpm -V` pour
> interroger et vérifier**.

## Les 20 commandes du guide

| N° | Commande | Rôle | Niveau |
|:-:|:--|:--|:--|
| 01 | `dnf install` | Installer un paquet et ses dépendances | 🟢 Essentiel |
| 02 | `dnf remove` | Désinstaller un paquet proprement | 🟢 Essentiel |
| 03 | `dnf check-update` | Lister les mises à jour disponibles (code 100) | 🟢 Essentiel |
| 04 | `dnf upgrade` | Mettre à jour un paquet ou tout le système | 🟢 Essentiel |
| 05 | `dnf install ./x.rpm` | Installer un RPM local avec ses dépendances | 🔵 Pratique |
| 06 | `dnf search` | Rechercher par nom et résumé (`--all` : description) | 🟢 Essentiel |
| 07 | `dnf info` | Afficher le détail d'un paquet | 🟢 Essentiel |
| 08 | `dnf list` | Lister les paquets installés, disponibles, à mettre à jour | 🟢 Essentiel |
| 09 | `dnf provides` | Trouver le paquet qui fournit un fichier | 🔵 Pratique |
| 10 | `dnf history` | Consulter le journal des transactions | 🔵 Pratique |
| 11 | `dnf history undo` | Annuler ou rejouer une transaction | 🟣 Avancé |
| 12 | `dnf downgrade` | Revenir à une version antérieure | 🟣 Avancé |
| 13 | `dnf reinstall` | Réinstaller un paquet endommagé | 🔵 Pratique |
| 14 | `dnf repolist` | Lister les dépôts, les activer ponctuellement | 🟢 Essentiel |
| 15 | `dnf config-manager` | Ajouter et configurer des dépôts | 🔵 Pratique |
| 16 | `dnf group` | Installer un ensemble cohérent de paquets | 🔵 Pratique |
| 17 | `dnf module` | Choisir la version d'une application (RHEL 8 et 9) | 🟣 Avancé |
| 18 | `dnf autoremove` | Supprimer les dépendances devenues inutiles | 🔵 Pratique |
| 19 | `dnf clean` | Vider et reconstruire le cache | 🔵 Pratique |
| 20 | `dnf check` | Vérifier la cohérence de la base RPM | 🟣 Avancé |

🟢 **Essentiel** : dès le premier jour · 🔵 **Pratique** : usage régulier · 🟣 **Avancé** : dépannage et cas particuliers

## Les options globales à connaître

Ces options se placent avant ou après la commande et fonctionnent avec la plupart d'entre elles :

| Option | Effet |
|:--|:--|
| `-y`, `--assumeyes` | Répondre « oui » à toutes les questions (scripts, automatisation) |
| `--assumeno` | Répondre « non » : affiche la transaction sans l'exécuter |
| `-q`, `--quiet` | Sortie réduite à l'essentiel, pratique dans les scripts |
| `--refresh` | Forcer le rafraîchissement des métadonnées avant d'agir |
| `--enablerepo` / `--disablerepo` | Activer ou désactiver un dépôt pour cette seule commande |
| `-x`, `--exclude=motif` | Exclure des paquets de la transaction |
| `--setopt=option=valeur` | Modifier un réglage de `dnf.conf` pour cette seule commande |
| `--downloadonly` | Télécharger les paquets sans les installer |
| `--allowerasing` | Autoriser la suppression de paquets en conflit (à manier avec soin) |

> [!TIP] Simuler avant d'agir
> `sudo dnf upgrade --assumeno` affiche exactement ce que ferait la mise à jour — paquets, versions, tailles —
> puis s'arrête sans rien modifier. C'est le moyen le plus simple de préparer une fenêtre de maintenance.
