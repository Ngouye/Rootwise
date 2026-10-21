| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Savoir qui a changé quoi, et quand | Aucun (lecture) | 🔵 Pratique |

Chaque opération qui modifie le système devient une transaction numérotée, enregistrée dans
`/var/lib/dnf/history.sqlite`. `dnf history` (équivalent de `dnf history list`) affiche les plus récentes en
premier.

```bash title="bash"
$ dnf history
ID | Command line      | Date and time    | Action(s)      | Altered
-------------------------------------------------------------------------------
14 | upgrade --refresh | 2026-09-01 10:15 | I, U           |       38
13 | install nginx     | 2026-08-28 14:02 | Install        |        4
12 | install httpd     | 2026-08-28 13:47 | Install        |        9
11 | remove cockpit    | 2026-08-20 09:30 | Removed        |       12
```

Les actions sont abrégées : **I** installation, **U** mise à jour, **E** suppression, **D** retour à une version
antérieure, **R** réinstallation, **O** remplacement d'un paquet obsolète. Le détail d'une transaction s'obtient
avec `history info` :

```bash title="bash"
$ dnf history info 13
Transaction ID : 13
Begin time     : Fri 28 Aug 2026 02:02:31 PM UTC
End time       : Fri 28 Aug 2026 02:02:36 PM UTC (5 seconds)
User           : Alice Martin <alice>
Return-Code    : Success
Releasever     : 9
Command Line   : install nginx
Packages Altered:
    Install nginx-1:1.20.1-22.el9.x86_64                @appstream
    Install nginx-core-1:1.20.1-22.el9.x86_64           @appstream
    Install nginx-filesystem-1:1.20.1-22.el9.noarch     @appstream
    Install rocky-logos-httpd-90.16-1.el9.noarch        @appstream
```

```bash title="bash"
$ dnf history list nginx          # transactions qui concernent nginx
$ dnf history info last           # la dernière transaction
$ dnf history userinstalled       # paquets installés explicitement
```
