| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Retrouver un paquet à partir d'une commande ou d'une bibliothèque | Aucun | 🔵 Pratique |

Une commande introuvable, une bibliothèque manquante signalée par une application : `dnf provides` (alias
`whatprovides`) indique quel paquet fournit un fichier ou une capacité donnée.

```bash title="bash"
$ dnf provides /usr/sbin/semanage
policycoreutils-python-utils-3.6-2.1.el9.noarch : SELinux policy core python
                                                : utilities
Repo        : appstream
Matched from:
Filename    : /usr/sbin/semanage
# Jokers : quand on ne connaît pas le chemin exact
$ dnf provides '*/bin/dig'
# Bibliothèque partagée réclamée par une application
$ dnf provides 'libssl.so.3()(64bit)'
```

Si vous indiquez seulement le nom d'une commande (`dnf provides semanage`), DNF essaie automatiquement les
chemins courants, comme `/usr/bin` et `/usr/sbin`.

> [!WARNING] Les apostrophes comptent
> Entourez toujours les jokers d'apostrophes (`'*/bin/dig'`) : sans elles, le shell tenterait de les
> développer lui-même avant de transmettre l'argument à DNF, avec un résultat imprévisible.

À l'inverse, pour savoir à quel paquet **installé** appartient un fichier déjà présent sur le disque,
interrogez directement la base RPM :

```bash title="bash"
$ rpm -qf /etc/ssh/sshd_config
openssh-server-8.7p1-45.el9.x86_64
```
