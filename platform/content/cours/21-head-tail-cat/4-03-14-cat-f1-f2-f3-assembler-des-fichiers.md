| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Réunir plusieurs fichiers en un seul | Toutes distributions (GNU coreutils) | 🟢 Essentiel |

La sortie de `cat` peut être redirigée : vers un fichier avec `>` (qui le **remplace**) ou `>>` (qui
**ajoute** à la fin), ou vers une autre commande avec un tube `|`. C'est ainsi qu'on assemble plusieurs
fichiers en un seul, dans l'ordre indiqué.

![cat lit 1.txt, 2.txt et 3.txt dans l'ordre ; le résultat part vers le terminal (sortie standard, par défaut : cat 1.txt 2.txt), vers > rapport.txt qui crée ou remplace le fichier, vers >> rapport.txt qui ajoute à la fin, ou vers | grep motif qui l'envoie à une autre commande (cat *.log | grep error)](images/figure-03.webp "Figure 3 — cat lit ses fichiers d'entrée dans l'ordre ; la redirection décide où va le résultat.")

```bash title="bash"
$ echo 'Partie 1 : introduction' > 1.txt
$ echo 'Partie 2 : analyse' > 2.txt
$ echo 'Partie 3 : conclusion' > 3.txt
$ cat 1.txt 2.txt 3.txt > rapport.txt
$ cat rapport.txt
Partie 1 : introduction
Partie 2 : analyse
Partie 3 : conclusion
# Cas concrets : fragments de configuration, segments de journal
$ cat header.txt body.txt footer.txt > report.txt
$ cat access.log.2 access.log.1 access.log > access-complet.log
```

> [!CAUTION] `>` remplace, `>>` ajoute
> `>` écrase le fichier de destination **sans avertissement**. Piège classique : `cat a.txt b.txt > a.txt`
> vide `a.txt` avant même que `cat` ne le lise, car le shell prépare la redirection en premier. Passez par un
> fichier temporaire. Pour une simple copie, `cp` reste préférable à `cat source > copie`.
