| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Diagnostiquer un script ou une configuration | Toutes distributions (GNU coreutils) | 🟣 Avancé |

C'est l'option la plus précieuse en dépannage. `-A` rend visible ce qu'aucun éditeur ne montre : les
tabulations apparaissent sous la forme `^I`, la fin de chaque ligne est marquée par `$` et le retour
chariot des fichiers Windows (CRLF) apparaît en `^M`.

![À gauche, un script tel qu'un éditeur l'affiche : #!/bin/bash, echo "Sauvegarde", puis cp -a /etc /backup en retrait ; à droite, le même script vu par cat -A : #!/bin/bash^M\$, echo "Sauvegarde"^M\$, ^Icp -a /etc /backup suivi de deux espaces puis \$ ; légende : ^M retour chariot Windows (CRLF), ^I tabulation, points pour les espaces en fin de ligne, \$ fin de ligne](images/figure-04.webp "Figure 4 — Ce que montre un éditeur… et ce que révèle cat -A.")

```bash title="bash"
$ ./suspect.sh
-bash: ./suspect.sh: /bin/bash^M: bad interpreter: No such file or directory
$ cat -A suspect.sh
#!/bin/bash^M$
echo "Sauvegarde"^M$
^Icp -a /etc /backup  $
# Corriger : supprimer les retours chariot Windows
$ sed -i 's/\r$//' suspect.sh            # ou : dos2unix suspect.sh
```

| Option | Effet |
|:--|:--|
| `-A` | Tout révéler (équivaut à `-vET`) |
| `-E` | Afficher `$` en fin de ligne : repère les espaces finaux |
| `-T` | Afficher les tabulations sous la forme `^I` |
| `-v` | Afficher les autres caractères non imprimables (`^M`…) |

> [!TIP] Le réflexe diagnostic
> Un script qui échoue avec « bad interpreter », une configuration refusée alors qu'elle « semble
> correcte » : avant de chercher plus loin, un `cat -A` sur le fichier révèle en une seconde les fins de
> ligne Windows, les tabulations et les espaces parasites.
