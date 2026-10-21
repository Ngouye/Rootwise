| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Savoir d'où viennent les paquets | Aucun (lecture) | 🟢 Essentiel |

`dnf repolist` affiche les dépôts activés ; `--all` y ajoute les dépôts désactivés, avec leur état. Chaque dépôt
est décrit par un fichier `.repo` dans `/etc/yum.repos.d/`.

```bash title="bash"
$ dnf repolist
repo id          repo name
appstream        Rocky Linux 9 - AppStream
baseos           Rocky Linux 9 - BaseOS
epel             Extra Packages for Enterprise Linux 9 - x86_64
extras           Rocky Linux 9 - Extras
$ dnf repolist --all
repo id          repo name                                    status
appstream        Rocky Linux 9 - AppStream                    enabled
baseos           Rocky Linux 9 - BaseOS                       enabled
crb              Rocky Linux 9 - CRB                          disabled
extras           Rocky Linux 9 - Extras                       enabled
# Détails : URL, nombre de paquets, date de mise à jour
$ dnf repolist -v epel
```

## Activer un dépôt le temps d'une commande

```bash title="bash"
$ sudo dnf --enablerepo=crb install ninja-build
$ sudo dnf --disablerepo=epel upgrade
# N'interroger QUE le dépôt indiqué
$ dnf --repo=epel list --available | head
```

> [!NOTE] Ponctuel ou persistant
> `--enablerepo` et `--disablerepo` n'agissent que sur la commande en cours. Pour modifier **durablement**
> l'état d'un dépôt, utilisez `dnf config-manager` (fiche 15).
