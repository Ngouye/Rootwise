Les outils se complètent selon l'**horizon de temps** qui vous intéresse :

![Trois horizons : maintenant, le diagnostic en direct — que se passe-t-il en ce moment ? (top, htop, btop, vmstat, iostat, iotop, ss, iftop, nethogs, tcpdump) ; hier, l'historique — que s'est-il passé cette nuit ? (atop -r, sar, nmon -f, vnstat, collectl, lastcomm) ; demain, supervision et alertes — qui me préviendra la prochaine fois ? (monit, monitorix, netdata, nagios, arpwatch, suricata)](images/figure-02.webp "Figure 2 — Trois horizons, trois familles d'outils : maintenant, hier, et demain.")

## Installer l'essentiel en une fois

```bash title="bash"
# Debian / Ubuntu
$ sudo apt install sysstat htop atop btop iotop lsof tcpdump iftop nethogs \
    iptraf-ng vnstat nmon
# RHEL, Rocky Linux, AlmaLinux (activer EPEL d'abord), Fedora
$ sudo dnf install epel-release
$ sudo dnf install sysstat htop atop btop iotop lsof tcpdump iftop nethogs \
    iptraf-ng vnstat nmon
```

> [!TIP] Paquet introuvable ?
> Selon la version de la distribution, un outil peut manquer ou changer de nom (`iotop-c`, par exemple).
> `apt search outil` ou `dnf search outil` vous le diront en quelques secondes. `top`, `vmstat`, `free` et `ss`
> sont, eux, préinstallés presque partout.

## Les 60 premières secondes face à un serveur lent

Avant d'ouvrir un outil graphique, cette séquence de dix commandes, popularisée par **Brendan Gregg** (Netflix),
donne en une minute une image fiable de l'état du système :

| Commande | Ce qu'il faut regarder |
|:--|:--|
| `uptime` | La charge moyenne sur 1, 5 et 15 minutes : monte-t-elle ou baisse-t-elle ? |
| `dmesg -T \| tail` | Erreurs du noyau : manque de mémoire (OOM killer), erreurs disque, réseau |
| `vmstat 1` | File d'exécution (`r`), swap (`si`/`so`), attente d'E/S (`wa`), vol de CPU (`st`) |
| `mpstat -P ALL 1` | Un seul cœur saturé ? Signe d'un traitement non parallélisé |
| `pidstat 1` | Quels processus consomment le CPU, seconde après seconde |
| `iostat -xz 1` | Latence (`r_await`, `w_await`), file d'attente (`aqu-sz`), occupation (`%util`) |
| `free -m` | Mémoire réellement disponible (colonne `available`) |
| `sar -n DEV 1` | Débit des interfaces : proche de la limite de la carte ? |
| `sar -n TCP,ETCP 1` | Connexions TCP actives et passives, retransmissions |
| `top` | Vue d'ensemble pour confirmer les pistes trouvées |

> [!NOTE] Paquet sysstat
> `mpstat`, `pidstat`, `iostat` et `sar` sont fournis par le paquet **sysstat**. Pour que `sar` dispose aussi d'un
> historique, activez sa collecte : `sudo systemctl enable --now sysstat`.
