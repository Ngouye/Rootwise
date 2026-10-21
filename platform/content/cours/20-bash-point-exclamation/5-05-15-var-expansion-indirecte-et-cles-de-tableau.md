| 🎯 Objectif | 🖥️ Contexte | 📶 Niveau |
|:--|:--|:--|
| Lire une variable dont le nom est dans une autre | Terminal et scripts | 🟣 Avancé |

Dans une expansion de paramètre, `!` a encore un autre sens : `${!nom}` utilise la **valeur** de `nom`
comme **nom** d'une autre variable. Avec un tableau, `${!tab[@]}` renvoie les **indices** (ou les clés),
pas les valeurs.

```bash title="bash"
$ nginx_port=8080
$ service=nginx_port
$ echo "${!service}"
8080
$ fruits=(pomme banane mangue)
$ echo "${!fruits[@]}"          # les indices, pas les valeurs
0 1 2
$ echo "${!BASH_V*}"            # noms de variables commençant par BASH_V
BASH_VERSINFO BASH_VERSION
```

```bash title="ports.sh"
declare -A ports=([nginx]=80 [postgres]=5432 [redis]=6379)
for service in "${!ports[@]}"; do
    echo "$service écoute sur le port ${ports[$service]}"
done
```

```bash title="bash"
$ bash ports.sh
nginx écoute sur le port 80
redis écoute sur le port 6379
postgres écoute sur le port 5432
```

> [!TIP] Bon à savoir
> L'ordre des clés d'un tableau associatif n'est pas garanti. Depuis Bash 4.3, `declare -n` (référence
> nommée) offre une alternative plus lisible à `${!var}` : `declare -n ref=nginx_port; echo "$ref"`.
