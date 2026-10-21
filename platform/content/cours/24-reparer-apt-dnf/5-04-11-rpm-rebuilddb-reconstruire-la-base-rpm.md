| 🎯 Objectif | 🐧 Systèmes | 🚦 Risque |
|:--|:--|:--|
| Réparer des index RPM illisibles | RHEL · Rocky Linux · AlmaLinux · Fedora | 🟡 Modéré |

Si `dnf` ou `rpm` signalent un problème dans la base elle-même — par exemple « error: cannot open Packages
database in /var/lib/rpm » —, reconstruisez ses index. Par précaution, **sauvegardez d'abord** le répertoire de
la base :

```bash title="bash"
# 1. Sauvegarder la base RPM
$ sudo cp -a /var/lib/rpm /var/lib/rpm.bak-$(date +%F)
# 2. Reconstruire les index
$ sudo rpm --rebuilddb
# 3. Contrôler
$ rpm -qa | wc -l
$ sudo dnf check
```

> [!NOTE] Étape facultative
> Cette étape n'est utile qu'en cas d'erreur de base RPM. Si `dnf check` fonctionne normalement, passez
> directement à l'étape suivante.
