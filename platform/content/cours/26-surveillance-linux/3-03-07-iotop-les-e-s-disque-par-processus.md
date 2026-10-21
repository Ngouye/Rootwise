| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Trouver le processus qui sature le disque | `iotop` ou `iotop-c` | 🖥️ Terminal |

`iostat` dit **quel disque** souffre ; `iotop` dit **quel processus** en est responsable. Il présente les lectures
et écritures de chaque processus à la manière de `top`.

```bash title="bash"
$ sudo apt install iotop          # ou iotop-c ; RHEL : sudo dnf install iotop
$ sudo iotop -oPa
Total DISK READ:     0.00 B/s | Total DISK WRITE:    12.45 M/s
Current DISK READ:   0.00 B/s | Current DISK WRITE:  14.02 M/s
    PID  PRIO  USER    DISK READ  DISK WRITE  SWAPIN     IO>    COMMAND
   1873  be/4  mysql      0.00 B    184.20 M  0.00 %  7.41 %  mysqld
   3310  be/4  root       0.00 B     21.06 M  0.00 %  1.12 %  rsync -a /srv/ /backup/
    612  be/3  root       0.00 B      2.31 M  0.00 %  0.40 %  [jbd2/nvme0n1p2-8]
```

| Option | Effet |
|:--|:--|
| `-o`, `--only` | N'afficher que les processus qui font réellement des E/S |
| `-P`, `--processes` | Regrouper par processus plutôt que par thread |
| `-a`, `--accumulated` | Afficher les totaux cumulés depuis le lancement |
| `-b -n 5 -d 10` | Mode batch : 5 mesures espacées de 10 s, pour un journal |

> [!NOTE] Colonnes SWAPIN et `IO>` vides ?
> Sur les noyaux récents, iotop affiche « CONFIG_TASK_DELAY_ACCT … not enabled » : la comptabilité des délais est
> désactivée par défaut. Activez-la le temps du diagnostic avec `sudo sysctl kernel.task_delayacct=1`, puis
> remettez 0.
