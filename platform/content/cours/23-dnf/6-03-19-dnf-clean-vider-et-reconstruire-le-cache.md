| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Libérer de l'espace, forcer des métadonnées fraîches | root (`sudo`) | 🔵 Pratique |

DNF garde en cache les métadonnées des dépôts et, selon la configuration, les paquets téléchargés. Un cache
corrompu ou périmé explique bien des erreurs étranges : `dnf clean` le vide, `dnf makecache` le reconstruit.

```bash title="bash"
$ du -sh /var/cache/dnf
412M    /var/cache/dnf
$ sudo dnf clean all
68 files removed
$ sudo dnf makecache
Rocky Linux 9 - BaseOS                          3.1 MB/s | 2.4 MB     00:00
Rocky Linux 9 - AppStream                       6.8 MB/s | 8.9 MB     00:01
Rocky Linux 9 - Extras                           38 kB/s |  16 kB     00:00
Metadata cache created.
```

| Commande | Ce qui est supprimé |
|:--|:--|
| `dnf clean all` | Tout : métadonnées, paquets et cache dérivé |
| `dnf clean metadata` | Métadonnées des dépôts — le plus utile après un changement de dépôt |
| `dnf clean packages` | Paquets RPM conservés dans le cache |
| `dnf clean dbcache` | Fichiers de cache calculés à partir des métadonnées |
| `dnf clean expire-cache` | Rien : les métadonnées sont seulement marquées comme expirées |

> [!TIP] Quand nettoyer ?
> Après l'ajout ou la modification d'un dépôt, en cas d'erreur « Failed to download metadata » ou de somme de
> contrôle, ou quand `/var` manque d'espace. Inutile avant chaque mise à jour : l'option `--refresh` suffit.
