![Partie 04](images/p20-bandeau-partie.webp)

Côté Red Hat, les séquelles typiques d'une mise à jour interrompue sont des **paquets enregistrés en double**.
On les détecte, on les supprime, on reconstruit si besoin la base RPM, puis on réaligne le système sur les
dépôts.

![RHEL/Rocky/AlmaLinux en quatre étapes : 9. détecter (dnf check), 10. supprimer (dnf remove --duplicates), 11. reconstruire si nécessaire (rpm --rebuilddb), 12. réaligner (dnf distro-sync) ; openssl-libs 3.2.2-4 et 3.2.2-6 en doublon deviennent une version unique, 3.2.2-6](images/p20-illustration-3.webp "RHEL / Rocky / AlmaLinux — quatre étapes")

| Étape | Commande | Rôle |
|:-:|:--|:--|
| 09 | `dnf check` | Détecter les doublons et incohérences |
| 10 | `dnf remove --duplicates` | Supprimer les anciennes versions |
| 11 | `rpm --rebuilddb` | Reconstruire la base RPM, si nécessaire |
| 12 | `dnf distro-sync` | Réaligner le système sur les dépôts |
