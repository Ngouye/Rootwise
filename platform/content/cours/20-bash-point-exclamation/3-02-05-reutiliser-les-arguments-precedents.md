| 🎯 Objectif | 🖥️ Contexte | 📶 Niveau |
|:--|:--|:--|
| Ne plus retaper les chemins longs | Terminal interactif | 🟢 Essentiel |

Vous venez de lister un répertoire et voulez maintenant le format long ? Inutile de retaper le chemin :
`!$` insère le dernier argument de la commande précédente.

```bash title="bash"
$ ls /home/alice/Binary/firefox
$ ls -l !$
ls -l /home/alice/Binary/firefox
```

| Désignateur | Mot(s) repris de la commande précédente |
|:--|:--|
| `!$` | Le dernier argument |
| `!^` | Le premier argument |
| `!*` | Tous les arguments, sans le nom de la commande |
| `!:0` | Le nom de la commande seul |

> [!WARNING] Attention aux options avec `!*`
> `!*` reprend aussi les options. Après `mkdir -p app/logs app/cache app/tmp`, la commande
> `chmod 750 !*` devient `chmod 750 -p app/logs …` et échoue. `!:2*` ne garde que les mots à partir du
> deuxième — ici, les seuls répertoires. Après l'échec, le `mkdir` est devenu l'avant-dernière commande :
> on écrit donc `!-2:2*`.

```bash title="bash"
$ mkdir -p app/logs app/cache app/tmp
$ chmod 750 !*
chmod 750 -p app/logs app/cache app/tmp
chmod: invalid option -- 'p'
$ chmod 750 !-2:2*              # mots 2 et suivants du mkdir
chmod 750 app/logs app/cache app/tmp
```

> [!TIP] Le raccourci clavier Alt+.
> **Alt+.** (ou **Échap** puis **.**) insère le dernier argument de la
> commande précédente à l'emplacement du curseur, **sans rien exécuter** : vous voyez ce que vous obtenez.
> Chaque nouvel appui remonte d'une commande dans l'historique.
