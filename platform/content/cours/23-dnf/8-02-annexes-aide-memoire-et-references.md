Ces annexes rassemblent les informations à garder sous la main : aide-mémoire par besoin, équivalences avec
apt, fichiers de DNF, réglages utiles, messages d'erreur et glossaire.

## A. Aide-mémoire : « Je veux… »

| Je veux… | Commande |
|:--|:--|
| Installer nginx | `sudo dnf install nginx` |
| Installer un RPM téléchargé | `sudo dnf install ./paquet.rpm` |
| Désinstaller un paquet | `sudo dnf remove nginx` |
| Voir les mises à jour disponibles | `dnf check-update` |
| Tout mettre à jour | `sudo dnf upgrade --refresh` |
| Seulement les correctifs de sécurité | `sudo dnf upgrade --security` |
| Savoir s'il faut redémarrer | `sudo dnf needs-restarting -r` |
| Trouver le paquet d'une commande | `dnf provides '*/bin/dig'` |
| Annuler la dernière transaction | `sudo dnf history undo last` |
| Revenir à la version précédente | `sudo dnf downgrade nginx` |
| Activer CRB durablement | `sudo dnf config-manager --set-enabled crb` |
| Installer les outils de développement | `sudo dnf group install "Development Tools"` |
| Libérer de l'espace | `sudo dnf autoremove && sudo dnf clean all` |

## B. Équivalences apt ↔ dnf

| Action | Debian / Ubuntu | Famille Red Hat |
|:--|:--|:--|
| Rafraîchir les métadonnées | `apt update` | `dnf makecache` |
| Lister les mises à jour | `apt list --upgradable` | `dnf check-update` |
| Tout mettre à jour | `apt upgrade` | `dnf upgrade` |
| Installer | `apt install nginx` | `dnf install nginx` |
| Supprimer | `apt remove nginx` | `dnf remove nginx` |
| Supprimer les orphelins | `apt autoremove` | `dnf autoremove` |
| Rechercher | `apt search motclé` | `dnf search motclé` |
| Détails d'un paquet | `apt show nginx` | `dnf info nginx` |
| Paquet fournissant un fichier | `apt-file search fichier` | `dnf provides fichier` |
| Historique | `/var/log/apt/history.log` | `dnf history` |
| Vider le cache | `apt clean` | `dnf clean all` |
| Outil bas niveau | `dpkg` (paquets .deb) | `rpm` (paquets .rpm) |

## C. Fichiers et répertoires de DNF

| Emplacement | Rôle |
|:--|:--|
| `/etc/dnf/dnf.conf` | Configuration principale (section `[main]`) |
| `/etc/yum.repos.d/*.repo` | Définition des dépôts |
| `/etc/dnf/protected.d/` | Paquets protégés contre la suppression |
| `/etc/pki/rpm-gpg/` | Clés GPG publiques des dépôts |
| `/var/cache/dnf/` | Cache des métadonnées et des paquets (DNF 4) |
| `/var/lib/dnf/history.sqlite` | Historique des transactions (DNF 4) |
| `/var/log/dnf.log`, `dnf.rpm.log` | Journaux de DNF 4 et des opérations RPM |
| `/var/cache/libdnf5/` | Cache de DNF5 |
| `/var/log/dnf5.log` | Journal de DNF5 |
| `/var/lib/rpm/` | Base RPM des paquets installés (lien vers `/usr/lib/sysimage/rpm` sur Fedora) |

## D. Réglages utiles de dnf.conf

```ini title="/etc/dnf/dnf.conf"
[main]
gpgcheck=True
installonly_limit=3
clean_requirements_on_remove=True
best=True
skip_if_unavailable=False
max_parallel_downloads=10
keepcache=False
```

| Réglage | Effet |
|:--|:--|
| `gpgcheck` | Vérifier la signature de chaque paquet (à laisser activé) |
| `installonly_limit` | Nombre de noyaux conservés (3 par défaut) |
| `clean_requirements_on_remove` | Supprimer les dépendances inutiles avec le paquet |
| `best` | Exiger la version la plus récente, ou échouer |
| `max_parallel_downloads` | Téléchargements simultanés (3 par défaut, 20 au maximum) |
| `fastestmirror` | Choisir le miroir le plus rapide (à tester : gain variable) |
| `keepcache` | Conserver les RPM téléchargés (utile hors ligne ou pour undo) |
| `defaultyes` | Proposer « oui » par défaut à la confirmation |
| `exclude` | Paquets ignorés par toutes les commandes |

## E. Messages d'erreur courants

| Message | Cause et solution |
|:--|:--|
| `Error: Unable to find a match: xyz` | Nom erroné ou dépôt désactivé (EPEL, CRB) : `dnf search`, `dnf provides`, `dnf repolist --all` |
| `Failed to download metadata for repo 'xyz'` | Réseau, proxy ou miroir indisponible : vérifier l'URL, `dnf clean metadata`, ou désactiver le dépôt |
| `GPG check FAILED` / `Public key … is not installed` | Importer la clé de l'éditeur (`rpm --import`) après vérification — jamais `--nogpgcheck` |
| `Waiting for process with pid 1234 to finish.` | Un autre DNF (ou PackageKit) travaille : patienter, puis vérifier le processus |
| `… conflicts with file from package …` | Deux paquets livrent le même fichier : choisir l'un d'eux ou, après analyse, `--allowerasing` |
| `nothing provides … needed by …` | Dépendance absente des dépôts actifs : activer CRB ou EPEL, ou utiliser `--skip-broken` |
| `… removing the following protected packages` | Paquet vital protégé : revoir la transaction plutôt que forcer |
| `All matches were filtered out by modular filtering` | Le paquet appartient à un flux non activé : `dnf module enable` ou `reset` |

## F. Glossaire

| Terme | Définition |
|:--|:--|
| **RPM** | Format de paquet et outil bas niveau de la famille Red Hat |
| **Dépôt** | Serveur ou répertoire qui publie des paquets et leurs métadonnées |
| **Métadonnées** | Index d'un dépôt (*repodata*) : liste des paquets, dépendances, avis de sécurité |
| **Transaction** | Ensemble cohérent d'opérations calculé et appliqué en une fois par DNF |
| **NEVRA** | Nom, époque, version, release, architecture : l'identité complète d'un paquet |
| **BaseOS / AppStream** | Dépôts principaux de RHEL : système de base et applications |
| **EPEL / CRB** | Paquets supplémentaires de Fedora pour RHEL / outils de développement |
| **Groupe** | Ensemble de paquets installables en une commande |
| **Module, flux, profil** | Application, version majeure et ensemble de paquets (RHEL 8 et 9) |
| **installonly** | Paquets installés côte à côte au lieu d'être remplacés (noyau) |

## G. Sources et références

- Anusha Saive, « 20 commandes DNF que tout administrateur Linux devrait connaître », *Tecmint*
  (tecmint.com), mis à jour le 1er septembre 2026. Article dont ce guide reprend le plan et qu'il corrige et
  enrichit.
- Pages de manuel : `dnf(8)`, `dnf.conf(5)`, `dnf5(8)`, `rpm(8)` ; documentation de DNF (dnf.readthedocs.io)
  et de DNF5 (dnf5.readthedocs.io).
- Documentation Red Hat Enterprise Linux 9 : « Managing software with the DNF tool » ; documentation Fedora
  sur le passage à DNF5.
