| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Trouver le nom exact d'un paquet | Aucun | 🟢 Essentiel |

`dnf search` cherche un mot-clé dans le **nom** et le **résumé** des paquets disponibles, sans tenir compte de
la casse. Les correspondances exactes sur le nom apparaissent en premier.

```bash title="bash"
$ dnf search nginx
========================= Name Exactly Matched: nginx ==========================
nginx.x86_64 : A high performance web server and reverse proxy server
======================== Name & Summary Matched: nginx =========================
nginx-all-modules.noarch : A meta package that installs all available Nginx
                         : modules
nginx-core.x86_64 : nginx minimal core
nginx-filesystem.noarch : The basic directory layout for the Nginx server
nginx-mod-stream.x86_64 : Nginx stream modules
```

Ajoutez `--all` pour étendre la recherche à la description et à l'URL des paquets — utile quand on cherche
une **fonction** plutôt qu'un nom :

```bash title="bash"
$ dnf search --all "reverse proxy"
# Lister les paquets dont le nom suit un motif (jokers autorisés)
$ dnf list --available 'python3-*yaml*'
```

> [!TIP] Paquet introuvable ?
> Un logiciel absent des résultats se trouve peut-être dans un dépôt désactivé : EPEL, CRB (CodeReady Builder)
> ou un dépôt d'éditeur. `dnf --enablerepo='*' search motclé` interroge tous les dépôts configurés, même
> désactivés — c'est plus lent, mais exhaustif.
