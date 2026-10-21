| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Afficher exactement N lignes | Toutes distributions (GNU coreutils) | 🟢 Essentiel |

L'option `-n` fixe le nombre de lignes affichées. La forme abrégée `-5` est équivalente et très répandue :

```bash title="bash"
$ sudo head -n 5 /var/log/syslog
Aug 18 05:06:36 srv01 systemd[1]: Starting logrotate.service - Rotate log files...
Aug 18 05:06:36 srv01 rsyslogd: rsyslogd was HUPed
Aug 18 05:06:36 srv01 systemd[1]: logrotate.service: Deactivated successfully.
Aug 18 05:06:36 srv01 systemd[1]: Finished logrotate.service - Rotate log files.
Aug 18 05:09:01 srv01 CRON[2214]: (root) CMD (/usr/local/bin/backup.sh)
$ sudo head -5 /var/log/syslog          # forme abrégée équivalente
```

> [!TIP] Selon la distribution
> Sur RHEL, Rocky Linux et AlmaLinux, le journal système principal s'appelle `/var/log/messages`. Sur
> Debian 12 et les conteneurs minimaux, `/var/log/syslog` peut ne pas exister : les journaux sont alors
> dans journald (fiche 12).
