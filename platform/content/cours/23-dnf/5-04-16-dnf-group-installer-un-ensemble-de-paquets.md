| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Déployer un environnement complet en une commande | root (`sudo`) pour installer | 🔵 Pratique |

Un **groupe** rassemble des paquets qui servent un même but : outils de développement, administration,
sécurité… Les **groupes d'environnement** vont plus loin et décrivent un système entier, comme « Server with
GUI » ou « Minimal Install ».

```bash title="bash"
$ dnf group list
Available Environment Groups:
   Server with GUI
   Server
   Minimal Install
   Workstation
Installed Groups:
   Container Management
Available Groups:
   Development Tools
   Headless Management
   System Tools
$ dnf group info "Development Tools"
Group: Development Tools
 Description: A basic development environment.
 Mandatory Packages:
   autoconf
   automake
   gcc
   …
```

```bash title="bash"
$ sudo dnf group install "Development Tools"
# Avec les paquets optionnels du groupe
$ sudo dnf group install --with-optional "Development Tools"
# Syntaxe abrégée : l'identifiant du groupe précédé de @
$ sudo dnf install @development
```

> [!TIP] Noms ou identifiants ?
> Les noms affichés peuvent être traduits selon la langue du système, pas les identifiants.
> `dnf group list -v` affiche les identifiants entre parenthèses : `development` sur RHEL et dérivés,
> `development-tools` sur Fedora. Dans un script, utilisez toujours l'identifiant.
