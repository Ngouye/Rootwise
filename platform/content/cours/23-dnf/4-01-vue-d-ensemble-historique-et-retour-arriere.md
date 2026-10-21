![Partie 03](images/p19-bandeau-partie.webp)

Chaque opération DNF est enregistrée comme une **transaction numérotée**. Cet historique permet de savoir qui
a changé quoi et quand, et surtout de **revenir en arrière** lorsqu'une mise à jour pose problème.

![L'historique, votre filet de sécurité : dnf history liste les transactions 10 à 14 (install vim, remove cockpit, install httpd, install nginx, upgrade --refresh) ; la transaction 13 peut être détaillée (history info 13), annulée (history undo 13) ou rejouée (history redo 13), et history rollback 11 revient à un état antérieur](images/p19-illustration-3.webp "L'historique, votre filet de sécurité")

| Fiche | Commande | Rôle |
|:-:|:--|:--|
| 10 | `dnf history` | Consulter l'historique des transactions |
| 11 | `dnf history undo` | Annuler ou rejouer une transaction |
| 12 | `dnf downgrade` | Revenir à une version antérieure |
| 13 | `dnf reinstall` | Réinstaller un paquet endommagé |
