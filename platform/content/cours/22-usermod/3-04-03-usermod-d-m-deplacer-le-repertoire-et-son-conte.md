| 🎯 Objectif | 📁 Fichiers modifiés | 🚦 Risque |
|:--|:--|:--|
| Migrer le répertoire personnel | `/etc/passwd` + répertoire personnel | 🟡 Modéré |

Pour changer le chemin **et** déplacer le contenu existant, combinez `-d` avec `-m` :

![En haut, usermod -d /srv/alice alice modifie seulement le chemin dans /etc/passwd : les fichiers (.bashrc, .profile, .ssh/, projets/) restent dans /home/alice et /srv/alice n'existe pas ; en bas, usermod -d /srv/alice -m alice modifie le chemin et déplace tout le contenu vers /srv/alice](images/figure-03.webp "Figure 3 — -d modifie seulement le chemin enregistré ; -d -m déplace aussi les fichiers.")

```bash title="bash"
# Vérifier l'espace disponible avant une grosse migration
$ df -h /home /srv
$ sudo usermod -d /srv/alice -m alice
$ ls -ld /srv/alice
drwxr-x--- 4 alice alice 4096 Sep  1 11:04 /srv/alice
```

## Points de contrôle en production

| Point | Action |
|:--|:--|
| **Destination existante** | `usermod -m` refuse de fusionner deux répertoires : la cible ne doit pas déjà exister |
| **Autre système de fichiers** | Le déplacement devient une copie suivie d'une suppression : prévoyez temps et espace libre |
| **SELinux** (RHEL, Rocky…) | Rétablir les contextes : `sudo restorecon -Rv /srv/alice` |
| **Chemins codés en dur** | `sudo grep -R "/home/alice" /etc/systemd/system /etc/cron* /etc/ssh 2>/dev/null` |
