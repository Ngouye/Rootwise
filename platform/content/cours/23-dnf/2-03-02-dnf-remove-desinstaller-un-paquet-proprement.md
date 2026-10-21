| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Retirer un logiciel et ses dépendances inutiles | root (`sudo`) | 🟢 Essentiel |

`dnf remove` désinstalle le paquet indiqué ainsi que les paquets qui en dépendent. Avec le réglage par défaut
`clean_requirements_on_remove=True`, DNF retire aussi les dépendances installées automatiquement et devenues
inutiles.

```bash title="bash"
$ sudo dnf remove nginx
Dependencies resolved.
================================================================================
 Package               Arch      Version              Repository          Size
================================================================================
Removing:
 nginx                 x86_64    1:1.20.1-22.el9      @appstream         113 k
Removing unused dependencies:
 nginx-core            x86_64    1:1.20.1-22.el9      @appstream         1.7 M
 nginx-filesystem      noarch    1:1.20.1-22.el9      @appstream          141
 rocky-logos-httpd     noarch    90.16-1.el9          @appstream          14 k

Transaction Summary
================================================================================
Remove  4 Packages

Freed space: 1.8 M
Is this ok [y/N]:
```

> [!CAUTION] Effet domino
> Si d'autres paquets dépendent de celui que vous retirez, ils figurent dans la section « Removing dependent
> packages » et seront supprimés avec lui. Retirer une bibliothèque peut ainsi emporter une grande partie du
> système : en cas de doute, répondez **N**.

Certains paquets vitaux — `dnf`, `systemd`, `sudo`, le noyau en cours d'exécution — sont **protégés** par les
fichiers de `/etc/dnf/protected.d/` : DNF refuse de les supprimer.

```bash title="bash"
$ sudo dnf remove sudo
Error:
 Problem: The operation would result in removing the following protected
 packages: sudo
```
