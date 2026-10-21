| 🎯 Objectif | 🐧 Systèmes | 🚦 Risque |
|:--|:--|:--|
| Revenir sur une mise à jour problématique | RHEL · Rocky Linux · AlmaLinux · Fedora | 🟡 Modéré |

`dnf` conserve l'historique de chaque transaction. On peut le consulter, examiner une transaction précise et, si
une mise à jour pose problème, l'**annuler** :

```bash title="bash"
$ sudo dnf history
ID | Command line | Date and time    | Action(s) | Altered
---------------------------------------------------------
14 | upgrade      | 2026-10-01 09:12 | Upgrade   |      87
13 | install tmux | 2026-09-28 16:40 | Install   |       1
# Détail puis annulation de la transaction 14
$ sudo dnf history info 14
$ sudo dnf history undo 14
```

> [!NOTE] Condition
> L'annulation n'est possible que si les anciennes versions des paquets sont encore disponibles dans les dépôts
> configurés. Sous Debian et Ubuntu, il n'existe pas d'équivalent direct ; le journal
> `/var/log/apt/history.log` indique toutefois ce qui a été installé, mis à jour ou supprimé, et quand.
