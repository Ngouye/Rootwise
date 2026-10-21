![Illustration 3D : des cartons de paquets étiquetés rpm, glibc ou openssl filent vers un anneau lumineux violet](images/p27-illustration-2.webp "Illustration 3D · paquets en route vers le système")

Une mise à jour interrompue impressionne, mais apt et dnf conservent suffisamment d'informations pour une
récupération propre. La méthode tient en une phrase : **identifier d'abord ce qui bloque, puis laisser le
gestionnaire de paquets terminer son travail** au lieu de le forcer.

![La démarche complète : 0. sécuriser (tmux), 1. identifier (fuser -v, ps -fp), 2. terminer (dpkg --configure -a, dnf remove --duplicates), 3. réparer (apt install -f, rpm --rebuilddb), 4. vérifier (dpkg --audit, dnf check), 5. finaliser (apt upgrade, dnf distro-sync)](images/figure-05.webp "Figure 5 — La démarche complète, de la sécurisation de la session à la vérification finale.")

## ✅ Les bons réflexes

- Travailler dans **tmux** pour toute mise à jour à distance ;
- Identifier le processus avec `fuser` ou `ps` ;
- Laisser `unattended-upgrades` terminer ;
- `dpkg --configure -a`, puis `apt install -f` ;
- `dnf check`, puis `dnf remove --duplicates` ;
- Relire chaque transaction avant de confirmer ;
- Prendre un instantané avant une mise à jour majeure.

## ❌ Les erreurs à éviter

- Lancer une mise à jour majeure dans une simple session SSH ;
- Supprimer les verrous dès la première erreur ;
- Tuer un processus dpkg avec `kill -9` ;
- Forcer avec `dpkg --force-all` ;
- Retirer des paquets avec `rpm -e --nodeps` ;
- Valider sans lire une liste de suppressions ;
- Mettre à jour la production sans sauvegarde.
