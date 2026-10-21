| 🎯 Objectif | 🖥️ Contexte | 📶 Niveau |
|:--|:--|:--|
| Agir sur tout, sauf certains fichiers | Terminal et scripts | 🟣 Avancé |

`!(motif)` fait partie des **motifs étendus** (`extglob`) : il correspond à tous les noms **sauf** ceux du
motif. L'option est désactivée par défaut dans les scripts ; en interactif, certaines distributions
l'activent déjà via bash-completion.

```bash title="bash"
$ shopt extglob
extglob         off
$ shopt -s extglob
$ ls
README.md  a.pdf  b.txt  c.conf
$ ls !(*.pdf)                   # vérifier d'abord
README.md  b.txt  c.conf
$ rm !(*.pdf|*.conf|README.md)  # tout sauf PDF, .conf et README.md
```

![rm !(*.pdf|*.conf|README.md) conserve README.md, rapport.pdf, nginx.conf et facture.pdf (exclus du motif) et supprime notes.txt, build.log, cache.tmp et script.sh](images/figure-07.webp "Figure 7 — Ce que garde et ce que supprime rm !(*.pdf|*.conf|README.md).")

| Motif étendu | Correspond à |
|:--|:--|
| `!(motif)` | tout **sauf** le motif |
| `?(motif)` | zéro ou une occurrence du motif |
| `*(motif)` · `+(motif)` | zéro ou plusieurs · une ou plusieurs occurrences |
| `@(a\|b)` | exactement l'un des motifs |

> [!CAUTION] Vérifier avant de supprimer
> Testez toujours le motif avec `ls` avant `rm`. Les fichiers cachés ne sont pas concernés (sauf avec
> `shopt -s dotglob`) et le motif ne descend pas dans les sous-répertoires. Sans `extglob`, Bash répond
> « syntax error near unexpected token ».
