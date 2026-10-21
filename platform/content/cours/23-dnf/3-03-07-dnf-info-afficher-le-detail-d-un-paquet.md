| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Connaître version, dépôt, licence et description | Aucun | 🟢 Essentiel |

`dnf info` affiche la fiche d'identité d'un paquet : version, release, architecture, taille, dépôt, licence et
description. Si le paquet est installé et qu'une mise à jour existe, les deux versions apparaissent.

```bash title="bash"
$ dnf info nginx
Available Packages
Name         : nginx
Epoch        : 1
Version      : 1.20.1
Release      : 22.el9
Architecture : x86_64
Size         : 36 k
Source       : nginx-1.20.1-22.el9.src.rpm
Repository   : appstream
Summary      : A high performance web server and reverse proxy server
URL          : https://nginx.org
License      : BSD
Description  : Nginx is a web server and a reverse proxy server for HTTP, SMTP,
             : POP3 and IMAP protocols, with a strong focus on high concurrency,
             : performance and low memory usage.
```

Pour cibler uniquement la version installée — et savoir de quel dépôt elle provient — ajoutez `--installed` :

```bash title="bash"
$ dnf info --installed nginx | grep -E 'Version|Release|Repository|From repo'
Version      : 1.20.1
Release      : 22.el9
Repository   : @System
From repo    : appstream
```

> [!TIP] Aller plus loin avec repoquery
> `dnf repoquery` interroge les métadonnées en détail : `dnf repoquery --requires nginx` liste ses
> dépendances, `dnf repoquery --whatrequires nginx` les paquets qui dépendent de lui, et
> `dnf repoquery -l nginx` les fichiers qu'il installe.
