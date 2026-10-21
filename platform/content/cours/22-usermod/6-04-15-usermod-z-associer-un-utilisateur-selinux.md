| 🎯 Objectif | 📁 Fichiers modifiés | 🚦 Risque |
|:--|:--|:--|
| Restreindre le contexte de sécurité | Base SELinux (seusers) | 🟡 Modéré |

Sur RHEL, Rocky Linux, AlmaLinux, Fedora et tout système où SELinux est actif, `-Z` associe le compte à un
**utilisateur SELinux**, qui détermine son contexte de sécurité à la connexion. `staff_u` ou `user_u` imposent
plus de restrictions que `unconfined_u`, selon la politique en place.

```bash title="bash"
$ sudo usermod -Z staff_u bob
$ sudo semanage login -l
Login Name           SELinux User         MLS/MCS Range        Service
__default__          unconfined_u         s0-s0:c0.c1023       *
bob                  staff_u              s0-s0:c0.c1023       *
root                 unconfined_u         s0-s0:c0.c1023       *
# Supprimer la correspondance explicite
$ sudo usermod -Z "" bob
```

> [!NOTE] Ubuntu et AppArmor
> Ubuntu utilise AppArmor par défaut : `-Z` n'y a d'intérêt que si SELinux a été volontairement installé et
> activé. `semanage` est fourni par le paquet `policycoreutils-python-utils`.
