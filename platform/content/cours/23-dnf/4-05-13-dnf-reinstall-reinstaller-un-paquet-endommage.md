| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Restaurer des fichiers supprimés ou corrompus | root (`sudo`) | 🔵 Pratique |

Un binaire supprimé par erreur, une bibliothèque corrompue : `dnf reinstall` réinstalle **la même version** du
paquet et restaure ses fichiers d'origine. Commencez par identifier le problème avec `rpm -V` :

```bash title="bash"
$ sudo rm /usr/bin/curl                 # l'accident
$ rpm -V curl
missing     /usr/bin/curl
$ sudo dnf reinstall curl
$ rpm -V curl && echo "curl est intact"
curl est intact
```

La réinstallation exige que la version installée soit encore disponible dans un dépôt ou dans le cache. Si ce
n'est plus le cas, mettez le paquet à jour (`dnf upgrade curl`) : le résultat est le même, les fichiers sont
réécrits.

> [!NOTE] Fichiers de configuration
> Les fichiers de configuration que vous avez modifiés (marqués `%config(noreplace)` dans le paquet) sont
> conservés : `dnf reinstall` ne remet pas votre configuration à zéro.

## Quelle commande pour quelle situation ?

| Situation | Commande |
|:--|:--|
| Binaire ou bibliothèque supprimé, corrompu | `sudo dnf reinstall paquet` |
| Version installée absente des dépôts | `sudo dnf upgrade paquet` ou `sudo dnf distro-sync paquet` |
| Retrouver un fichier de configuration d'origine | `dnf download paquet`, puis extraction avec `rpm2cpio` |
| Base RPM incohérente (doublons, dépendances) | `dnf check` (fiche 20) |
