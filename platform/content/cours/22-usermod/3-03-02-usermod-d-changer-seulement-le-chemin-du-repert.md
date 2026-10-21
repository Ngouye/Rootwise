| 🎯 Objectif | 📁 Fichiers modifiés | 🚦 Risque |
|:--|:--|:--|
| Pointer le compte vers un répertoire existant | `/etc/passwd` (champ 6) | 🟡 Modéré |

Utilisée seule, `-d` modifie **uniquement le chemin** enregistré dans `/etc/passwd`. Elle ne déplace pas
l'ancien répertoire, ne crée pas la destination et ne copie aucun fichier.

```bash title="bash"
$ sudo usermod -d /srv/alice alice
$ getent passwd alice
alice:x:1001:1001:Alice Martin, équipe DevOps:/srv/alice:/bin/bash
```

> [!WARNING] Erreur fréquente
> Si `/srv/alice` n'existe pas, la connexion suivante affiche « Could not chdir to home directory » :
> l'utilisateur atterrit dans `/` sans ses fichiers de démarrage, ni sa configuration SSH. N'utilisez `-d`
> seul que si la destination est déjà prête.
