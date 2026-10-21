Quel que soit le système, la démarche suit la même logique : **sécuriser** la session, **identifier** ce qui
bloque, **laisser le gestionnaire de paquets terminer** son travail, puis **vérifier** la cohérence de la base
avant de reprendre la mise à jour.

![Mise à jour interrompue : 0. sécuriser la session (tmux new -s maj) ; côté Debian/Ubuntu, 1. identifier (sudo fuser -v /var/lib/dpkg/lock-frontend), 2. terminer (sudo dpkg --configure -a), 3. réparer (sudo apt install -f), 4. vérifier (sudo dpkg --audit), 5. finaliser (sudo apt update && sudo apt upgrade) ; côté RHEL/Rocky/AlmaLinux, 1. identifier (ps -fp suivi du PID), 2. nettoyer (sudo dnf remove --duplicates), 3. réparer si besoin (sudo rpm --rebuilddb), 4. vérifier (sudo dnf check), 5. finaliser (sudo dnf clean all && sudo dnf distro-sync) ; résultat : un système cohérent](images/figure-01.webp "Figure 1 — Les deux parcours de réparation côte à côte : Debian/Ubuntu à gauche, RHEL/Rocky/AlmaLinux à droite.")

## Les commandes, étape par étape

| Étape | Debian / Ubuntu | RHEL / Rocky / Alma | Risque |
|:--|:--|:--|:--|
| **0 · Sécuriser la session** | `tmux new -s maj` | `tmux new -s maj` | ⚪ Aucun |
| **1 · Identifier le blocage** | `sudo fuser -v /var/lib/dpkg/lock-frontend` | `ps -fp <PID>` | ⚪ Aucun |
| **2 · Terminer / nettoyer** | `sudo dpkg --configure -a` | `sudo dnf remove --duplicates` | 🟡 Modéré |
| **3 · Réparer** | `sudo apt install -f` | `sudo rpm --rebuilddb` (si besoin¹) | 🟡 Modéré |
| **4 · Vérifier** | `sudo dpkg --audit` | `sudo dnf check` | ⚪ Aucun |
| **5 · Finaliser** | `sudo apt update && sudo apt upgrade` | `sudo dnf clean all && sudo dnf distro-sync` | 🟡 Modéré |

¹ Sous RHEL, Rocky Linux et AlmaLinux, la reconstruction de la base RPM n'est utile qu'en cas d'erreur de base
de données (étape 11).

⚪ **Aucun** : lecture seule · 🟢 **Faible** : modification sûre · 🟡 **Modéré** : relire avant de confirmer ·
🔴 **Élevé** : dernier recours

> [!IMPORTANT] La règle d'or
> On **identifie d'abord** ce qui bloque, puis on **laisse le gestionnaire de paquets terminer** son travail.
> On ne force jamais : ni suppression précipitée des verrous, ni `kill -9`, ni option `--force-all`.
