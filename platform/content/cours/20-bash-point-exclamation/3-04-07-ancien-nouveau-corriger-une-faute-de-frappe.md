| 🎯 Objectif | 🖥️ Contexte | 📶 Niveau |
|:--|:--|:--|
| Remplacer un mot dans la commande précédente | Terminal interactif | 🟢 Essentiel |

La **substitution rapide** remplace la première occurrence d'un texte dans la commande précédente, puis
exécute le résultat.

```bash title="bash"
$ systemctl status ngnix
Unit ngnix.service could not be found.
$ ^ngnix^nginx^
systemctl status nginx
```

Seule la **première** occurrence change. Pour remplacer toutes les occurrences, utilisez le
modificateur `:gs` (*global substitute*) :

```bash title="bash"
$ vim /etc/nginx/nginx.conf
$ ^nginx^apache^                # première occurrence seulement
vim /etc/apache/nginx.conf
$ !-2:gs/nginx/apache/          # toutes les occurrences
vim /etc/apache/apache.conf
```

| Forme | Effet |
|:--|:--|
| `^a^b^` | Remplace la première occurrence de *a* par *b* dans la commande précédente |
| `!!:s/a/b/` | Forme explicite équivalente |
| `!!:gs/a/b/` | Remplace toutes les occurrences |
| `!!:gs/a/b/:p` | Affiche le résultat sans l'exécuter |

> [!TIP] Bon à savoir
> Le `^` final est facultatif : `^ngnix^nginx` fonctionne aussi. Le séparateur `/` de `:s` peut être
> remplacé par un autre caractère quand le texte contient des barres obliques : `!!:gs|/var|/srv|`.
