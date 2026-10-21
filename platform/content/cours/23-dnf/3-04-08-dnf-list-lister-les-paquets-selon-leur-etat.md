| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Dresser un inventaire : installés, disponibles, à jour | Aucun | 🟢 Essentiel |

`dnf list` affiche les paquets selon leur état. Sans option, la commande liste à la fois les paquets installés
et ceux disponibles dans les dépôts — souvent plusieurs milliers de lignes : **filtrez toujours**.

```bash title="bash"
$ dnf list --installed | head -4
Installed Packages
NetworkManager.x86_64          1:1.52.0-5.el9_6          @baseos
acl.x86_64                     2.3.1-4.el9               @anaconda
alternatives.x86_64            1.24-2.el9                @baseos
$ dnf list --available 'php*'
$ dnf list --upgrades
# Compter les paquets installés (plus rapide avec rpm)
$ rpm -qa | wc -l
684
```

| Option | Paquets affichés |
|:--|:--|
| `--installed` | Installés (la colonne dépôt commence par `@`) |
| `--available` | Disponibles dans les dépôts et non installés |
| `--upgrades` | Installés pour lesquels une mise à jour existe |
| `--extras` | Installés mais absents de tous les dépôts actifs |
| `--recent` | Ajoutés récemment aux dépôts |
| `--autoremove` | Que `dnf autoremove` supprimerait |
| `--showduplicates` | Toutes les versions disponibles, pas seulement la plus récente |

## Quels paquets ont été installés en dernier ?

```bash title="bash"
$ rpm -qa --last | head -3
nginx-1.20.1-22.el9.x86_64                 Fri 28 Aug 2026 02:02:35 PM UTC
nginx-core-1.20.1-22.el9.x86_64            Fri 28 Aug 2026 02:02:34 PM UTC
rocky-logos-httpd-90.16-1.el9.noarch       Fri 28 Aug 2026 02:02:34 PM UTC
```

> [!NOTE] Compatibilité DNF5
> DNF 4 accepte encore les formes sans tirets (`dnf list installed`). DNF5 n'accepte que les options
> (`dnf list --installed`) : prenez dès maintenant cette habitude, valable partout.
