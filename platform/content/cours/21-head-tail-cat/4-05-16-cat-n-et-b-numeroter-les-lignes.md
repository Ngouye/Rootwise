| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Repérer et citer une ligne précise | Toutes distributions (GNU coreutils) | 🔵 Pratique |

`-n` numérote **toutes** les lignes, y compris les lignes vides ; `-b` ne numérote que les lignes **non
vides**. Pratique pour situer une ligne citée dans un message d'erreur ou pour échanger avec un collègue.

```bash title="bash"
$ cat -n /etc/hosts
     1  127.0.0.1 localhost
     2  127.0.1.1 srv01
     3
     4  # The following lines are desirable for IPv6 capable hosts
     5  ::1     ip6-localhost ip6-loopback
# Numéroter seulement les lignes non vides
$ cat -b /etc/nginx/nginx.conf
```

| Option | Effet |
|:--|:--|
| `-n` | Numéroter toutes les lignes |
| `-b` | Numéroter uniquement les lignes non vides (prioritaire sur `-n`) |
| `-s` | Fusionner les lignes vides consécutives en une seule |
