| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Surveiller un journal sur la durée | Toutes distributions (GNU coreutils) | 🟣 Avancé |

Les journaux sont régulièrement « tournés » par **logrotate** : le fichier courant est renommé (`syslog`
devient `syslog.1`) puis un nouveau fichier vide est créé. Or `tail -f` suit le **descripteur** du fichier
ouvert au départ : après la rotation, il continue de surveiller l'ancien fichier, qui ne reçoit plus rien.

![Avant la rotation, tail -f syslog et tail -F syslog lisent le même fichier syslog (inode 1234) ; logrotate le renomme en syslog.1 : tail -f reste sur l'ancien fichier, qui n'est plus alimenté, tandis que tail -F rouvre le nouveau syslog (inode 5678) par son nom et reçoit les nouvelles lignes](images/figure-02.webp "Figure 2 — Pendant une rotation, tail -f reste sur l'ancien fichier ; tail -F rouvre le nouveau.")

Avec `--follow=name`, `tail` suit le fichier **par son nom** et le rouvre lorsqu'il est remplacé. L'option
`-F` combine `--follow=name` et `--retry` (réessayer si le fichier est momentanément absent) : c'est la
forme à retenir.

```bash title="bash"
$ sudo tail --follow=name /var/log/syslog
# Forme courte recommandée (= --follow=name --retry)
$ sudo tail -F /var/log/syslog
# Message affiché au moment d'une rotation
tail: '/var/log/syslog' has been replaced; following new file
# RHEL / Rocky / AlmaLinux
$ sudo tail -F /var/log/messages
```

> [!TIP] La bonne habitude
> Pour toute surveillance longue — une nuit, un week-end, une campagne de tests —, utilisez `tail -F`
> plutôt que `tail -f` : c'est la seule forme qui survit aux rotations.
