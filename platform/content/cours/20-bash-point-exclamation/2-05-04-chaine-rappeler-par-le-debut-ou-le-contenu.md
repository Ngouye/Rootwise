| 🎯 Objectif | 🖥️ Contexte | 📶 Niveau |
|:--|:--|:--|
| Retrouver la dernière commande qui correspond | Terminal interactif | 🔵 Pratique |

`!ls` relance la plus récente commande qui **commence** par `ls`. `!?Desktop?` relance la plus récente
qui **contient** `Desktop`, n'importe où dans la ligne.

```bash title="bash"
$ ls /home > /dev/null
$ ls -l /home/avi/Desktop > /dev/null
$ ls -lA /usr/bin > /dev/null
$ !ls
ls -lA /usr/bin > /dev/null
$ !?Desktop?
ls -l /home/avi/Desktop > /dev/null
```

Le piège classique : le texte qui suit l'événement n'est **pas** un critère de recherche. Il est
simplement ajouté à la commande retrouvée :

```bash title="bash"
$ !ls -l
ls -lA /usr/bin > /dev/null -l
```

| Syntaxe | Relance la dernière commande qui… |
|:--|:--|
| `!chaîne` | commence par *chaîne* |
| `!?chaîne?` | contient *chaîne* (le `?` final est facultatif en fin de ligne) |

> [!NOTE] Une seule correspondance
> Bash exécute toujours la correspondance **la plus récente**, sans proposer de choix. Ajoutez `:p`
> (`!ls:p`, `!?Desktop?:p`) pour vérifier avant d'exécuter, ou utilisez **Ctrl+R** pour
> parcourir les correspondances une à une. Si rien ne correspond, Bash répond « event not found ».
