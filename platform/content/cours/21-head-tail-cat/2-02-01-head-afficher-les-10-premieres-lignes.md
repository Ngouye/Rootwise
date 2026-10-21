| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Jeter un œil au début d'un fichier | Toutes distributions (GNU coreutils) | 🟢 Essentiel |

Syntaxe : `head [options] [fichier…]`. Sans option, `head` affiche les **10 premières lignes** de chaque
fichier indiqué :

```bash title="bash"
$ head /etc/passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
```

> [!NOTE] Lire une ligne de `/etc/passwd`
> Chaque ligne décrit un compte : nom, mot de passe (stocké ailleurs, d'où le `x`), UID, GID, description,
> répertoire personnel et shell de connexion.
