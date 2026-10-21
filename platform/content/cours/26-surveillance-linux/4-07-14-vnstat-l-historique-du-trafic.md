| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Connaître la consommation par heure, jour et mois | `vnstat` (EPEL sur RHEL) | ⚙️ Service |

`vnstat` tient un **historique du trafic** de chaque interface à partir des compteurs du noyau, sans capturer de
paquets : il est très léger. Le service `vnstatd` collecte, la commande `vnstat` interroge.

```bash title="bash"
$ sudo apt install vnstat && sudo systemctl enable --now vnstat
$ vnstat -m -i enp0s3

 enp0s3  /  monthly

        month        rx      |     tx      |    total    |   avg. rate
     ------------------------+-------------+-------------+---------------
       2026-07    184.21 GiB |   62.48 GiB |  246.69 GiB |  791.18 kbit/s
       2026-08    201.77 GiB |   70.12 GiB |  271.89 GiB |  872.03 kbit/s
       2026-09     48.36 GiB |   17.05 GiB |   65.41 GiB |   1.03 Mbit/s
     ------------------------+-------------+-------------+---------------
     estimated    193.44 GiB |   68.20 GiB |  261.64 GiB |
```

| Option | Affichage |
|:--|:--|
| `-h` / `-d` / `-m` / `-y` | Par heure / jour / mois / année |
| `-t` | Les journées les plus chargées |
| `-l` | Débit en direct (**Ctrl+C** affiche le résumé) |
| `--json` | Sortie JSON, pour un script ou une supervision |

> [!NOTE] Et vnStat PHP ?
> L'article d'origine présentait vnStat PHP, une interface web pour vnstat aujourd'hui peu maintenue. Pour des
> graphiques, préférez `vnstati`, livré avec vnstat, qui génère des images PNG (exemple :
> `vnstati -s -i enp0s3 -o trafic.png`). Netdata (fiche 21) affiche aussi ces données.
