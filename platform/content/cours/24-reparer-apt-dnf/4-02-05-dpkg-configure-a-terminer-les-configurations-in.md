| 🎯 Objectif | 🐧 Systèmes | 🚦 Risque |
|:--|:--|:--|
| Configurer les paquets restés décompressés | Debian · Ubuntu · Linux Mint | 🟢 Faible |

C'est la commande réclamée par le message « dpkg was interrupted ». Elle reprend la configuration de **tous**
les paquets décompressés mais non configurés, en exécutant leurs scripts d'installation :

```bash title="bash"
$ sudo dpkg --configure -a
Setting up libssl3t64:amd64 (3.0.13-0ubuntu3.5) ...
Setting up openssl (3.0.13-0ubuntu3.5) ...
Processing triggers for man-db (2.12.0-4build2) ...
Processing triggers for libc-bin (2.39-0ubuntu8.4) ...
```

Une série de lignes « Setting up » défile à mesure que les paquets sont traités. Une **absence de sortie** est
aussi un bon signe : aucun paquet n'attendait de configuration.

> [!TIP] Si une question s'affiche
> Certains paquets demandent s'il faut conserver ou remplacer un fichier de configuration que vous avez modifié.
> En cas de doute, **conservez votre version** (réponse par défaut **N**) : le nouveau fichier est enregistré à
> côté, avec l'extension `.dpkg-dist`.
