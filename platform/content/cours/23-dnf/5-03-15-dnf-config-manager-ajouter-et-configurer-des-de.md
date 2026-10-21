| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Activer, désactiver ou ajouter un dépôt durablement | root (`sudo`) | 🔵 Pratique |

`dnf config-manager`, fourni par le paquet `dnf-plugins-core`, modifie les fichiers `.repo` à votre place, sans
édition manuelle.

```bash title="bash"
$ sudo dnf install -y dnf-plugins-core
# Activer durablement le dépôt CRB (Rocky Linux, AlmaLinux 9)
$ sudo dnf config-manager --set-enabled crb
# Désactiver un dépôt
$ sudo dnf config-manager --set-disabled epel-testing
# Ajouter le dépôt d'un éditeur à partir de son fichier .repo
$ sudo dnf config-manager \
    --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
```

| Distribution | Activer les paquets de développement |
|:--|:--|
| Rocky Linux, AlmaLinux 9 et 10 | `sudo dnf config-manager --set-enabled crb` |
| Rocky Linux, AlmaLinux 8 | `sudo dnf config-manager --set-enabled powertools` |
| RHEL 9 (abonnement) | Dépôt `codeready-builder-for-rhel-9-$(arch)-rpms`, à activer avec `sudo subscription-manager repos --enable` |
| EPEL (Rocky, AlmaLinux) | `sudo dnf install epel-release` |

## Écrire un fichier .repo à la main

```ini title="/etc/yum.repos.d/interne.repo"
[interne]
name=Dépôt interne de l'entreprise
baseurl=https://repo.exemple.lan/el9/$basearch/
enabled=1
gpgcheck=1
gpgkey=https://repo.exemple.lan/RPM-GPG-KEY-interne
```

> [!CAUTION] gpgcheck=1, toujours
> Ne désactivez jamais la vérification des signatures (`gpgcheck=0`) sur un dépôt de production : sans elle,
> rien ne garantit que les paquets n'ont pas été modifiés entre le dépôt et votre serveur.
