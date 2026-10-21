![Partie 05](images/p23-bandeau-partie.webp)

Une fois le système rétabli, quelques habitudes simples évitent de revivre la même situation : des **sessions
qui survivent aux coupures**, des **points de restauration** et une bonne connaissance de **l'historique** des
transactions.

![Trois habitudes qui évitent la panne : sessions persistantes, la mise à jour continue même si SSH coupe (tmux new -s maj, tmux attach -t maj) ; point de restauration, revenir en arrière en quelques minutes (instantané de VM, lvcreate --snapshot) ; traçabilité, savoir ce qui a changé et l'annuler (dnf history undo, /var/log/apt/history.log)](images/p23-illustration-3.webp "Trois habitudes qui évitent la panne")

| Étape | Outil | Rôle |
|:-:|:--|:--|
| 13 | `tmux` | Des mises à jour qui survivent aux coupures SSH |
| 14 | Instantanés | Un point de retour avant les mises à jour majeures |
| 15 | `dnf history` | Consulter et annuler une transaction |
| 16 | Journaux et minuteurs | Savoir ce qui s'est passé, et quand |
