| 🎯 Objectif | 🐧 Systèmes | 🚦 Risque |
|:--|:--|:--|
| Éviter les conflits avec les mises à jour automatiques | Tous | ⚪ Aucun |

Avant une intervention manuelle, vérifiez si une mise à jour automatique est **programmée ou en cours** ; après
un incident, les journaux racontent précisément ce qui s'est passé.

```bash title="bash"
# Debian / Ubuntu : prochaines mises à jour automatiques
$ systemctl list-timers 'apt-daily*'
# Dernières opérations apt, et paquets restés partiels selon dpkg
$ less /var/log/apt/history.log
$ grep -E 'status (half|unpacked)' /var/log/dpkg.log | tail
# RHEL / Rocky / AlmaLinux : journal de dnf
$ sudo tail -n 50 /var/log/dnf.log
```

> [!TIP] Éviter les conflits
> Planifiez les mises à jour manuelles en dehors des créneaux automatiques, ou suspendez-les le temps de
> l'intervention : `sudo systemctl stop apt-daily.timer apt-daily-upgrade.timer` — sans oublier de les
> relancer ensuite avec `start`.
