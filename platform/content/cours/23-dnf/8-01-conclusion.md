![Illustration 3D : une file de cartons de paquets étiquetés rpm, glibc ou openssl entre dans un anneau lumineux violet](images/p35-illustration-2.webp "Illustration 3D · des paquets vers le système")

DNF est bien plus qu'un installateur : c'est un **outil de gestion du changement**. Chaque transaction est
calculée, présentée, signée, journalisée et, dans la plupart des cas, réversible. Utilisé avec méthode, il rend
la maintenance d'un parc Red Hat prévisible.

![La routine de maintenance en cinq temps : 1. vérifier (dnf check-update), 2. simuler (upgrade --assumeno), 3. mettre à jour (dnf upgrade), 4. contrôler (needs-restarting -r, dnf check), 5. nettoyer (dnf autoremove, dnf clean all)](images/figure-07.webp "Figure 7 — La routine de maintenance en cinq temps.")

## Les réflexes à retenir

- Lire le résumé de transaction avant de répondre `y`, en particulier les sections « Removing » ;
- `dnf check-update` avant chaque mise à jour, et son code **100** dans vos scripts ;
- `dnf history` pour comprendre, `history undo` ou `downgrade` pour revenir en arrière ;
- **Jamais** `--nogpgcheck` ni `gpgcheck=0` en production ;
- Les identifiants de groupes et de dépôts plutôt que les noms affichés dans les scripts ;
- La syntaxe à tirets (`--installed`, `--available`) : elle fonctionne aussi avec DNF5.

> [!TIP] Pour aller plus loin
> Automatisez l'application des correctifs avec `dnf-automatic` (minuteur systemd `dnf-automatic.timer`) ;
> pour passer d'une version de Fedora à la suivante, utilisez `dnf system-upgrade`.
