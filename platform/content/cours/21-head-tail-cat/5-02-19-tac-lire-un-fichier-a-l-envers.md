| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Voir les événements récents en premier | Toutes distributions (GNU coreutils) | 🔵 Pratique |

`tac` — `cat` écrit à l'envers — affiche un fichier en commençant par sa **dernière ligne**. Sur un journal,
les événements les plus récents apparaissent ainsi en premier.

```bash title="bash"
$ printf '%s\n' Janvier Février Mars Avril > mois.txt
$ tac mois.txt
Avril
Mars
Février
Janvier
# Les 20 événements les plus récents, du plus récent au plus ancien
$ sudo tac /var/log/syslog | head -n 20
```

> [!NOTE] Une vue ponctuelle
> Contrairement à `tail -f`, `tac` lit le fichier **une seule fois** puis s'arrête : c'est une vue
> ponctuelle, pas un suivi.
