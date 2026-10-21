| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Des milliers de métriques, à la seconde, dans le navigateur | Script officiel ou paquets | 🌐 Web |

**Netdata** collecte chaque seconde des milliers de métriques — système, conteneurs, bases de données, serveurs
web — et les affiche dans un **tableau de bord web interactif**. Il détecte automatiquement la plupart des services
et embarque des alertes prêtes à l'emploi.

```bash title="bash"
# Méthode officielle : télécharger le script, le lire, puis l'exécuter
$ wget -O /tmp/netdata-kickstart.sh https://get.netdata.cloud/kickstart.sh
$ less /tmp/netdata-kickstart.sh
$ sh /tmp/netdata-kickstart.sh --stable-channel --disable-telemetry
# Tableau de bord : http://adresse-du-serveur:19999
```

> [!IMPORTANT] Commande corrigée
> L'article d'origine utilisait `bash <(curl -Ss https://my-netdata.io/kickstart.sh)`, une ancienne adresse. Le
> script se télécharge désormais depuis **get.netdata.cloud**. Plutôt que de le passer directement au shell,
> téléchargez-le et **lisez-le avant de l'exécuter**. Netdata existe aussi dans les dépôts de nombreuses
> distributions (`sudo apt install netdata`), dans une version souvent plus ancienne.

## Sécuriser l'accès au tableau de bord

Le port 19999 ne doit pas être ouvert sur Internet. Limitez Netdata à l'hôte local et consultez-le par un
**tunnel SSH** :

```ini title="/etc/netdata/netdata.conf (extrait)"
[web]
    bind to = 127.0.0.1
```

```bash title="bash"
$ sudo systemctl restart netdata
# Depuis votre poste : tunnel SSH, puis http://localhost:19999
$ ssh -L 19999:localhost:19999 admin@web01
```
