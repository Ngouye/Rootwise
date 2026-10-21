| 🎯 Objectif | 📁 Fichiers modifiés | 🚦 Risque |
|:--|:--|:--|
| Appliquer un profil complet d'un coup | Selon les options | 🔴 Élevé |

`usermod` accepte plusieurs options à la fois, ce qui est pratique pour mettre un compte au bon profil en
une seule commande :

```bash title="bash"
$ sudo usermod -d /srv/jack -m -s /bin/bash -e 2026-12-10 -f 7 \
    -c "Jack Durand, DevOps" -u 1600 -aG sudo,docker jack
# Vérifier chaque modification
$ getent passwd jack
jack:x:1600:1004:Jack Durand, DevOps:/srv/jack:/bin/bash
$ id jack
uid=1600(jack) gid=1004(jack) groups=1004(jack),27(sudo),988(docker)
$ sudo chage -l jack | grep 'Account expires'
Account expires                                    : Dec 10, 2026
```

> [!WARNING] Pas une transaction
> Une commande combinée **n'est pas atomique** : si une option échoue, les modifications précédentes peuvent
> déjà être appliquées. Testez les commandes complexes sur un compte jetable avant la production.

## Modifier un système hors ligne

Depuis un système de secours ou sur une image montée, `-R` applique la modification dans un **chroot** et
`-P` dans un **répertoire préfixe**, sans chroot :

```bash title="bash"
$ sudo usermod -R /mnt/sysroot -s /bin/bash jack
```
