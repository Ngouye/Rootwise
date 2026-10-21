| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Examiner la toute fin d'un fichier | Toutes distributions (GNU coreutils) | 🔵 Pratique |

Comme `head`, `tail` peut compter en octets avec `-c`. Utile pour lire la fin d'un fichier sans retours à la
ligne, ou vérifier comment se termine un fichier :

```bash title="bash"
$ sudo tail -c 100 /var/log/syslog
# Le fichier se termine-t-il par un saut de ligne ?
$ tail -c 1 script.sh | od -c
0000000  \n
0000001
```

> [!NOTE] Pourquoi c'est utile
> Un fichier texte doit se terminer par un saut de ligne. Sans lui, `cat` colle l'invite du shell à la
> dernière ligne et certains outils ignorent purement et simplement cette ligne.
