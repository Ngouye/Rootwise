| 🎯 Objectif | 📁 Fichiers modifiés | 🚦 Risque |
|:--|:--|:--|
| Donner accès à sudo, Docker, etc. | `/etc/group`, `/etc/gshadow` | 🟢 Faible |

Pour ajouter des groupes secondaires, utilisez **toujours `-a` avec `-G`**. Plusieurs groupes se séparent par
des virgules, sans espace.

```bash title="bash"
$ sudo usermod -aG docker,sudo alice
$ id -nG alice
editeurs sudo docker
```

| Distribution | Groupe administrateur |
|:--|:--|
| Ubuntu, Debian | `sudo usermod -aG sudo alice` |
| RHEL, Rocky, AlmaLinux, Fedora | `sudo usermod -aG wheel alice` |

```bash title="bash"
# DANGER : sans -a, la liste est REMPLACÉE (alice perd sudo)
$ sudo usermod -G docker alice
# Usage volontaire : retirer TOUS les groupes secondaires
$ sudo usermod -G "" alice
```

> [!NOTE] Prise en compte
> Les changements de groupes ne s'appliquent pas aux sessions déjà ouvertes : l'utilisateur doit se
> déconnecter puis se reconnecter. En attendant, `newgrp docker` ouvre un shell où le groupe est actif.
