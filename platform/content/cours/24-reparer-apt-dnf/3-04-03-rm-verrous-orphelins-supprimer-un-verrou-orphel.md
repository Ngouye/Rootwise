| 🎯 Objectif | 🐧 Systèmes | 🚦 Risque |
|:--|:--|:--|
| Débloquer apt quand plus aucun processus ne tourne | Debian · Ubuntu · Linux Mint | 🔴 Élevé |

En principe, un fichier de verrou sans processus ne bloque rien, puisque le noyau libère le verrou à la fin du
processus. Si l'erreur persiste malgré tout et qu'**aucun processus n'apparaît** — vérification faite avec
`sudo` —, on peut, en dernier recours, supprimer les fichiers de verrou, puis enchaîner **immédiatement** sur la
réparation :

```bash title="bash"
# 1. Vérifier qu'aucun processus apt/dpkg ne tourne
$ sudo fuser -v /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock
$ pgrep -a 'apt|dpkg|unattended'
# 2. Supprimer les verrous orphelins
$ sudo rm /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock
# 3. Reprendre immédiatement la configuration interrompue
$ sudo dpkg --configure -a
```

> [!CAUTION] Uniquement dans ce cas
> Ne supprimez **jamais** un verrou tant qu'un processus apt, dpkg ou unattended-upgrades est actif : c'est la
> cause la plus courante de corruption de la base des paquets.
