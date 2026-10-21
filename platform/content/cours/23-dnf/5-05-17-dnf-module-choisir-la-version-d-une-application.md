| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Installer Node.js, PHP ou PostgreSQL dans la version voulue | root (`sudo`) pour activer | 🟣 Avancé |

Sur RHEL 8 et 9 et leurs dérivés, le dépôt AppStream propose plusieurs versions de certaines applications sous
forme de **modules**. Chaque module offre des **flux** (*streams*, une version majeure) et des **profils** (un
ensemble de paquets adapté à un usage).

![Le module nodejs (dnf module list nodejs) propose trois flux : nodejs:18 et nodejs:22 disponibles, nodejs:20 activé ; le flux 20 a quatre profils : common [d], installation standard par défaut ; development, outils et en-têtes de développement ; minimal, le moteur seul ; s2i, images de conteneur source-to-image ; un seul flux actif par module, changer de version se fait avec switch-to](images/figure-04.webp "Figure 4 — Un module, ses flux et ses profils : un seul flux peut être actif à la fois.")

```bash title="bash"
$ dnf module list nodejs
Rocky Linux 9 - AppStream
Name     Stream   Profiles                                 Summary
nodejs   18       common [d], development, minimal, s2i    Javascript runtime
nodejs   20       common [d], development, minimal, s2i    Javascript runtime
nodejs   22       common [d], development, minimal, s2i    Javascript runtime

Hint: [d]efault, [e]nabled, [x]disabled, [i]nstalled
$ sudo dnf module enable nodejs:20
$ sudo dnf install nodejs
# Changer de version : basculer vers un autre flux
$ sudo dnf module switch-to nodejs:22
# Revenir à l'état initial du module
$ sudo dnf module reset nodejs
```

> [!NOTE] Une technologie en fin de vie
> Fedora a abandonné les modules à partir de la version 39, et RHEL 10 n'en propose plus : les versions
> alternatives y sont livrées comme des paquets ordinaires (sur Fedora, par exemple, `nodejs20` et
> `nodejs22`). Sur RHEL 8 et 9, les modules restent la méthode officielle.
