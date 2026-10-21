| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Voir les événements les plus récents | Toutes distributions (GNU coreutils) | 🟢 Essentiel |

Syntaxe : `tail [options] [fichier…]`. Sans option, `tail` affiche les **10 dernières lignes**, c'est-à-dire,
dans un journal, les événements les plus récents :

```bash title="bash"
$ sudo tail /var/log/syslog
# … (extrait des 10 lignes affichées)
Aug 24 15:55:01 srv01 CRON[17986]: (admin) CMD (/usr/local/bin/backup.sh)
Aug 24 15:56:15 srv01 systemd[1]: man-db.service: Deactivated successfully.
Aug 24 15:56:15 srv01 systemd[1]: Finished man-db.service - Daily man-db regeneration.
Aug 24 16:00:01 srv01 CRON[18307]: (admin) CMD (/usr/local/bin/backup.sh)
```

> [!TIP] Le bon ordre de lecture
> Dans un journal, la dernière ligne affichée par `tail` est l'événement le plus récent. Pour lire dans
> l'ordre inverse, du plus récent au plus ancien, utilisez `tac` (fiche 19).
