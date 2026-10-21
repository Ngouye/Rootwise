| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Observer un service pendant un dépannage | Toutes distributions (GNU coreutils) | 🟢 Essentiel |

L'option `-f` (*follow*) garde le fichier ouvert et affiche chaque nouvelle ligne **dès qu'elle est écrite**.
C'est la méthode classique pour observer un service pendant qu'on le teste ; **Ctrl+C** arrête le suivi.

```bash title="bash"
$ sudo tail -f /var/log/nginx/error.log
# Afficher d'abord les 50 dernières lignes, puis suivre
$ sudo tail -n 50 -f /var/log/nginx/access.log
# Suivre plusieurs journaux à la fois : un en-tête signale chaque changement
$ sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
==> /var/log/nginx/access.log <==
192.168.1.10 - - [24/Aug/2026:16:02:11 +0200] "GET / HTTP/1.1" 200 615 "-" "curl/8.5.0"
```

| Option | Effet |
|:--|:--|
| `-f` | Suivre le fichier ouvert (son descripteur) |
| `-n N -f` | Afficher les N dernières lignes, puis suivre |
| `-s N` | Vérifier les ajouts toutes les N secondes |
| `--pid=PID` | Arrêter le suivi quand le processus PID se termine |
| `-q` | Ne pas afficher les en-têtes de fichiers |

> [!TIP] Filtrer en direct
> Pour ne garder que les lignes utiles pendant le suivi, ajoutez `grep` :
> `sudo tail -f /var/log/nginx/error.log | grep --line-buffered -i 'error'`. L'option `--line-buffered`
> évite que `grep` ne retienne ses résultats lorsque la sortie est elle-même redirigée.
