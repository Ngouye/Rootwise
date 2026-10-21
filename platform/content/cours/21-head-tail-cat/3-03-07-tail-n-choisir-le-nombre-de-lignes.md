| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Afficher exactement les N dernières lignes | Toutes distributions (GNU coreutils) | 🟢 Essentiel |

Comme pour `head`, l'option `-n` fixe le nombre de lignes, et la forme abrégée `-20` est équivalente.
Exemple avec le journal d'authentification, qui trace les connexions SSH et l'usage de `sudo` :

```bash title="bash"
$ sudo tail -n 20 /var/log/auth.log
$ sudo tail -20 /var/log/auth.log            # forme abrégée équivalente

# RHEL / Rocky / AlmaLinux : ce journal s'appelle /var/log/secure
$ sudo tail -n 20 /var/log/secure
```
