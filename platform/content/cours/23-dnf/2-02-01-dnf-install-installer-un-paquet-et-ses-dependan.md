| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Ajouter un logiciel depuis les dépôts | root (`sudo`) | 🟢 Essentiel |

`dnf install` télécharge le paquet demandé et **toutes ses dépendances**, vérifie leurs signatures GPG, puis
les installe en une seule transaction. Avant d'agir, DNF affiche le **résumé de la transaction** et attend
votre confirmation.

```bash title="bash"
$ sudo dnf install nginx
Dependencies resolved.
================================================================================
 Package               Arch      Version              Repository          Size
================================================================================
Installing:
 nginx                 x86_64    1:1.20.1-22.el9      appstream           36 k
Installing dependencies:
 nginx-core            x86_64    1:1.20.1-22.el9      appstream          566 k
 nginx-filesystem      noarch    1:1.20.1-22.el9      appstream          8.4 k
 rocky-logos-httpd     noarch    90.16-1.el9          appstream           24 k

Transaction Summary
================================================================================
Install  4 Packages

Total download size: 635 k
Installed size: 1.8 M
Is this ok [y/N]: y
```

Plusieurs paquets peuvent être installés en une seule commande. L'option `-y` répond automatiquement
« oui », ce qui est utile dans les scripts :

```bash title="bash"
$ sudo dnf install -y nginx php-fpm
# Installer une version précise
$ sudo dnf install nginx-1:1.20.1-20.el9
# Installer à partir d'un fichier fourni, sans connaître le nom du paquet
$ sudo dnf install /usr/bin/dig
```

> [!WARNING] Lire avant de confirmer
> Le résumé de transaction est votre **dernier contrôle**. Une installation qui fait apparaître des sections
> « Removing » ou « Downgrading » mérite toujours une analyse avant de répondre `y`.
