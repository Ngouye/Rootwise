| 🎯 Objectif | 🖥️ Contexte | 📶 Niveau |
|:--|:--|:--|
| Relancer une commande précise sans la retaper | Terminal interactif | 🟢 Essentiel |

Bash numérote chaque commande enregistrée dans l'historique. Ce numéro s'appelle un **événement** : `!`
suivi du numéro relance la commande correspondante. Bash affiche d'abord la commande développée, puis
l'exécute.

```bash title="bash"
$ history | tail -4
 1549  pwd
 1550  ls -l
 1551  top
 1552  df -h
$ !1551
top
```

> [!WARNING] Pas d'espace après le `!`
> `!1551` déclenche l'expansion. `! 1551`, avec une espace, ne la déclenche pas : Bash cherche alors une
> commande nommée `1551` et répond « bash: 1551: command not found ».

## Retrouver un numéro rapidement

```bash title="bash"
$ history | grep nginx          # filtrer l'historique
 1498  sudo systemctl reload nginx
 1544  sudo nginx -t
$ history 5                     # seulement les 5 dernières commandes
```

> [!TIP] Un numéro stable
> Le numéro d'un événement ne change pas pendant la session : c'est la référence la plus fiable pour
> relancer plusieurs fois la même commande. Pour chercher par mot-clé de façon interactive, **Ctrl+R**
> (recherche inverse) reste l'alternative la plus confortable.
