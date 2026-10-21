| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Observer plusieurs sous-systèmes sur une même ligne | `collectl` | 🖥️ Terminal |

`collectl` collecte en continu des mesures sur le CPU, la mémoire, les disques, le réseau, les sockets, NFS, les
inodes ou les processus. Sa force : **aligner plusieurs sous-systèmes sur une même ligne horodatée**, ce qui
facilite les corrélations.

```bash title="bash"
$ collectl                        # par défaut : CPU, disques, réseau, chaque seconde
waiting for 1 second sample...
#<--------CPU--------><----------Disks-----------><----------Network---------->
#cpu sys inter  ctxsw KBRead  Reads KBWrit Writes   KBIn  PktIn  KBOut  PktOut
   6   2   812   1530      0      0    214     18     38    296    412     334
  14   4   954   1711   1840     42    536     61     41    311   8406    6012
$ collectl -sCDN -i 5             # détail par cœur (C), disque (D), interface (N)
$ collectl -sm --verbose          # mémoire détaillée
$ collectl --top                  # processus les plus consommateurs
```

| Sous-système (`-s`) | Mesures |
|:--|:--|
| `c` / `C` | Processeur : synthèse / par cœur |
| `d` / `D` | Disques : synthèse / par périphérique |
| `n` / `N` | Réseau : synthèse / par interface |
| `m` | Mémoire |
| `t` | TCP (connexions, retransmissions) |

> [!NOTE] Un projet discret
> collectl a peu évolué ces dernières années. Il reste pratique pour une corrélation rapide, mais pour l'historique
> à long terme, préférez `sar` (sysstat) ou `atop`, activement maintenus et présents partout.
