| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Installer un fichier `.rpm`, dépendances comprises | root (`sudo`) | 🔵 Pratique |

Certains éditeurs distribuent leurs logiciels sous forme de fichier `.rpm`. Contrairement à `rpm -i`, qui
échoue dès qu'une dépendance manque, `dnf install` va chercher les dépendances manquantes dans les dépôts
configurés.

```bash title="bash"
# Inspecter le fichier avant de l'installer
$ rpm -qpi ./app-2.4.1-1.x86_64.rpm         # éditeur, version, description
$ rpm -qpR ./app-2.4.1-1.x86_64.rpm         # dépendances requises
$ rpm -K ./app-2.4.1-1.x86_64.rpm           # signature et empreintes
./app-2.4.1-1.x86_64.rpm: digests signatures OK
# Installer : le « ./ » désigne un fichier local, pas un nom de paquet
$ sudo dnf install ./app-2.4.1-1.x86_64.rpm
# Installer directement depuis une URL
$ sudo dnf install \
    https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm
```

Le paquet installé est enregistré comme provenant de `@commandline` : il ne sera pas mis à jour par
`dnf upgrade`, sauf si l'éditeur fournit aussi un dépôt.

| Critère | `rpm -i fichier.rpm` | `dnf install ./fichier.rpm` |
|:--|:--|:--|
| **Dépendances** | Non résolues : l'installation échoue | Résolues depuis les dépôts actifs |
| **Historique** | Aucun | Transaction visible dans `dnf history` |
| **Annulation** | Manuelle (`rpm -e`) | `dnf history undo` |
| **Signature** | Contrôle manuel avec `rpm -K` | Non vérifiée par défaut (`localpkg_gpgcheck`) |

> [!CAUTION] Signature
> Par défaut, DNF 4 **ne vérifie pas la signature des fichiers locaux** : d'où l'intérêt de `rpm -K`. S'il
> signale « SIGNATURES NOT OK » ou une clé manquante, importez la clé publique de l'éditeur
> (`sudo rpm --import URL_DE_LA_CLÉ`) après avoir vérifié sa provenance. N'utilisez pas `--nogpgcheck` pour
> « faire passer » un paquet : c'est précisément le contrôle qui vous protège d'un fichier modifié.
