| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Contourner une régression | root (`sudo`) | 🟣 Avancé |

Une mise à jour introduit une régression ? `dnf downgrade` installe une version plus ancienne d'un paquet — par
défaut, la version immédiatement inférieure disponible.

```bash title="bash"
# Quelles versions sont disponibles ?
$ dnf --showduplicates list nginx
Installed Packages
nginx.x86_64            1:1.20.1-22.el9              @appstream
Available Packages
nginx.x86_64            1:1.20.1-16.el9_4.1          appstream
nginx.x86_64            1:1.20.1-20.el9              appstream
nginx.x86_64            1:1.20.1-22.el9              appstream
# Version immédiatement inférieure
$ sudo dnf downgrade nginx
# Version précise
$ sudo dnf downgrade nginx-1:1.20.1-16.el9_4.1
```

## Empêcher la prochaine mise à jour

Sans précaution, le prochain `dnf upgrade` réinstallera la version problématique. Le greffon **versionlock**
fige un paquet à sa version actuelle :

```bash title="bash"
$ sudo dnf install python3-dnf-plugin-versionlock
$ sudo dnf versionlock add nginx
$ dnf versionlock list
nginx-1:1.20.1-16.el9_4.1.*
# Lever le verrou une fois le correctif publié
$ sudo dnf versionlock delete nginx
```

> [!NOTE] Alternative sans greffon
> La directive `exclude=nginx*` dans `/etc/dnf/dnf.conf` bloque aussi les mises à jour. Elle est plus brutale :
> le paquet devient invisible pour toutes les commandes, y compris l'installation.
