Ces annexes rassemblent les informations à garder sous la main pendant une intervention : aide-mémoire par
famille de distributions, messages d'erreur courants, fichiers utiles et glossaire.

## A. Aide-mémoire Debian / Ubuntu

| Besoin | Commande |
|:--|:--|
| Qui détient le verrou ? | `sudo fuser -v /var/lib/dpkg/lock-frontend` |
| Détails d'un processus | `ps -fp <PID>` |
| Suivre les mises à jour automatiques | `sudo tail -f /var/log/unattended-upgrades/unattended-upgrades-dpkg.log` |
| Terminer les configurations | `sudo dpkg --configure -a` |
| Réparer les dépendances | `sudo apt install -f` |
| Vérifier la base | `sudo dpkg --audit` |
| Lister les paquets partiels | `dpkg -l \| grep -E '^i[UFH]'` |
| Réinstaller un paquet | `sudo apt install --reinstall <paquet>` |
| Vider le cache des paquets | `sudo apt clean` |
| Reprendre la mise à jour | `sudo apt update && sudo apt upgrade` |

## B. Aide-mémoire RHEL / Rocky / AlmaLinux

| Besoin | Commande |
|:--|:--|
| Quel processus dnf attend-il ? | `ps -fp <PID>` |
| Tâches dnf planifiées | `systemctl list-timers 'dnf*'` |
| Contrôler la base des paquets | `sudo dnf check` |
| Supprimer les doublons | `sudo dnf remove --duplicates` |
| Sauvegarder la base RPM | `sudo cp -a /var/lib/rpm /var/lib/rpm.bak` |
| Reconstruire la base RPM | `sudo rpm --rebuilddb` |
| Vider les caches | `sudo dnf clean all` |
| Réaligner sur les dépôts | `sudo dnf distro-sync` |
| Historique des transactions | `sudo dnf history` |
| Annuler une transaction | `sudo dnf history undo <ID>` |

## C. Messages d'erreur courants

| Message | Cause probable | Solution |
|:--|:--|:--|
| `Could not get lock /var/lib/dpkg/lock-frontend` | Un autre processus apt ou dpkg est actif | `fuser -v`, puis attendre (étape 02) |
| `dpkg was interrupted, you must manually run 'sudo dpkg --configure -a'` | Paquets décompressés mais non configurés | `sudo dpkg --configure -a` (étape 05) |
| `Unmet dependencies. Try 'apt --fix-broken install'` | Dépendances manquantes ou incohérentes | `sudo apt install -f` (étape 06) |
| `Could not get lock /var/lib/apt/lists/lock` | Un `apt update` est en cours | Patienter, puis relancer |
| `Waiting for process with pid … to finish` | Une autre instance de dnf travaille | `ps -fp <PID>`, patienter (étape 04) |
| `… is a duplicate with …` | Mise à jour RPM interrompue | `sudo dnf remove --duplicates` (étape 10) |
| `cannot open Packages database in /var/lib/rpm` | Index de la base RPM endommagés | `sudo rpm --rebuilddb` (étape 11) |

## D. Fichiers et journaux utiles

| Chemin | Système | Rôle |
|:--|:--|:--|
| `/var/lib/dpkg/lock-frontend` | Debian | Verrou de l'outil frontal (apt) |
| `/var/lib/dpkg/lock` | Debian | Verrou de la base dpkg |
| `/var/lib/dpkg/status` | Debian | État de chaque paquet installé |
| `/var/log/dpkg.log` | Debian | Journal détaillé des opérations dpkg |
| `/var/log/apt/history.log` | Debian | Historique des commandes apt |
| `/var/log/apt/term.log` | Debian | Sortie complète des installations |
| `/var/log/unattended-upgrades/` | Debian | Journaux des mises à jour automatiques |
| `/var/lib/rpm/` | RHEL | Base de données RPM |
| `/var/log/dnf.log` | RHEL | Journal de dnf |
| `/var/log/dnf.rpm.log` | RHEL | Opérations RPM effectuées par dnf |

## E. Sources et références

- Ravi Saive, « Comment corriger les erreurs de verrouillage apt et dnf après une mise à jour ayant échoué »,
  *Tecmint*, 1er octobre 2026 — tecmint.com/apt-dnf-fix-crashed-upgrade-lock-errors. Article dont ce guide
  reprend la démarche et qu'il enrichit.
- Pages de manuel Linux : `dpkg(1)`, `apt(8)`, `apt-get(8)`, `fuser(1)`, `dnf(8)`, `rpm(8)`, `tmux(1)`.
- Documentations officielles : Debian Reference (debian.org), Red Hat Enterprise Linux — gestion des logiciels
  (docs.redhat.com).

## F. Glossaire

| Terme | Définition |
|:--|:--|
| **apt** | Gestionnaire de paquets de haut niveau de Debian et Ubuntu : résout les dépendances et télécharge les paquets |
| **dpkg** | Outil de bas niveau qui installe, configure et supprime les paquets `.deb` |
| **dnf** | Gestionnaire de paquets de la famille Red Hat (successeur de yum) |
| **RPM** | Format de paquet et outil de bas niveau de la famille Red Hat ; tient la base des paquets installés |
| **Verrou** (lock) | Mécanisme qui garantit qu'un seul programme modifie la base des paquets à un instant donné |
| **PID** | Identifiant numérique unique d'un processus en cours d'exécution |
| **unattended-upgrades** | Service Debian/Ubuntu qui installe automatiquement les mises à jour de sécurité |
| **dnf-automatic** | Équivalent de unattended-upgrades pour la famille Red Hat |
| **Dépendance** | Paquet requis par un autre pour fonctionner |
| **Déclencheur** (trigger) | Action différée exécutée par dpkg après l'installation de paquets (index de manuels, cache des bibliothèques…) |
| **Doublon RPM** | Paquet enregistré en deux versions dans la base RPM après une mise à jour interrompue |
| **distro-sync** | Opération dnf qui aligne chaque paquet installé sur la version des dépôts |
| **tmux** | Multiplexeur de terminal : les sessions continuent sur le serveur après une déconnexion |
| **Instantané** (snapshot) | Copie de l'état d'un système à un instant donné, permettant un retour rapide en arrière |
