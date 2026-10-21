| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Surveiller des dizaines d'hôtes et alerter avant la panne | `nagios4` (Debian) · `nagios` (EPEL) | 🌐 Web |

**Nagios Core** est un système de supervision éprouvé : il vérifie régulièrement l'état des hôtes (serveurs Linux
et Windows, commutateurs, routeurs, imprimantes) et de leurs services, affiche le tout dans une interface web et
**prévient l'équipe** dès qu'un seuil est franchi.

```bash title="bash"
$ sudo apt install nagios4 monitoring-plugins        # Debian / Ubuntu
# Les sondes (plugins) sont de simples programmes : on peut les tester à la main
$ /usr/lib/nagios/plugins/check_disk -w 20% -c 10% -p /
DISK OK - free space: / 38122 MB (72% inode=91%);| /=14820MB;...
$ echo $?
0
```

| Code | État | Signification |
|:-:|:--|:--|
| 0 | **OK** | Tout va bien |
| 1 | **WARNING** | Seuil d'avertissement franchi (`-w`) |
| 2 | **CRITICAL** | Seuil critique franchi (`-c`) : intervention requise |
| 3 | **UNKNOWN** | La sonde n'a pas pu mesurer (erreur, délai dépassé) |

```ini title="Définition d'un hôte et d'un service"
define host {
    use                  linux-server
    host_name            web01
    address              192.168.0.10
}
define service {
    use                  generic-service
    host_name            web01
    service_description  HTTP
    check_command        check_http
}
```

> [!TIP] Vérifier avant de recharger
> `sudo nagios4 -v /etc/nagios4/nagios.cfg` (Debian) ou `sudo nagios -v /etc/nagios/nagios.cfg` (RHEL) valide la
> configuration. Pour les contrôles internes des hôtes distants (disque, charge), on utilise un agent comme NRPE ou
> des contrôles par SSH. Icinga, Zabbix ou Prometheus sont des alternatives répandues.
