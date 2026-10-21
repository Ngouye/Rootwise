| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Mesurer la charge et la latence de chaque périphérique | `sysstat` | 🖥️ Terminal |

`iostat` affiche l'utilisation du processeur et les statistiques d'E/S de chaque périphérique de stockage, local
ou distant (NFS). Utilisez toujours la forme étendue **`-x`**, et **`-z`** pour masquer les périphériques inactifs.

```bash title="bash"
$ sudo apt install sysstat        # ou : sudo dnf install sysstat
$ iostat -xz 2 2
Linux 6.8.0-79-generic (web01)    09/08/2026    _x86_64_    (4 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           6.21    0.03    1.94    9.80    0.00   82.02

Device      r/s     rkB/s  r_await     w/s     wkB/s  w_await  aqu-sz  %util
nvme0n1   42.50   2720.00     0.41  180.00   9216.00     2.85    0.53  38.20
sda        3.00     96.00    11.30   61.00   4880.00    24.70    1.54  92.10
```

*Sortie abrégée : seules les colonnes principales sont conservées.*

![Les quatre familles de métriques d'iostat -x : IOPS (r/s, w/s : nvme0n1 à 42,5 r/s et 180 w/s) ; débit (rkB/s, wkB/s : 9 216 kB/s écrits) ; latence, l'indicateur clé (r_await, w_await : durée moyenne d'une E/S en ms, attente comprise ; sda à 24,7 ms en écriture) ; saturation (aqu-sz, %util : sda à 92 %, HDD saturé)](images/figure-05.webp "Figure 5 — Les quatre familles de métriques d'iostat -x et leur lecture.")

> [!TIP] Et l'historique ?
> Une fois la collecte sysstat activée, `sar -d` affiche les mêmes métriques pour la journée écoulée. Pour un
> autre jour, indiquez le fichier du jour voulu avec l'option `-f` : `/var/log/sysstat/sa08` sur Debian,
> `/var/log/sa/sa08` sur RHEL.
