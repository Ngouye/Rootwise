| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Voir qui consomme CPU et mémoire, en temps réel | `procps-ng` (préinstallé) | 🖥️ Terminal |

`top` est présent sur pratiquement tous les systèmes Linux. Son **en-tête** résume l'état de la machine ; la
**liste** en dessous classe les processus, par défaut selon leur consommation de processeur, et se rafraîchit
toutes les 3 secondes.

![L'en-tête de top en cinq zones : 1. la charge moyenne (load average: 0.84, 0.62, 0.55) ; 2. les tâches (213 au total, 1 en cours, 212 en sommeil, 0 zombie) ; 3. le processeur (6.2 us, 1.9 sy, 0.9 wa, 0.0 st) ; 4. la mémoire et le swap (4419.2 avail Mem) ; 5. la liste des processus (mysqld, php-fpm8.3, containerd) avec PID, USER, RES, %CPU, %MEM et TIME+](images/figure-03.webp "Figure 3 — Les cinq zones de l'en-tête de top à savoir lire.")

| N° | Zone | Ce qu'il faut lire |
|:-:|:--|:--|
| 1 | **Charge moyenne** | Tâches en cours ou en attente (CPU ou disque), en moyenne sur 1, 5 et 15 min. À comparer au nombre de cœurs (`nproc`) : 4 sur 4 cœurs = machine pleinement occupée ; 12 sur 4 = file d'attente |
| 2 | **Tâches** | Des zombies ou beaucoup de tâches en cours méritent un examen |
| 3 | **Processeur** | `us` applications, `sy` noyau, `wa` attente d'E/S, `st` temps volé par l'hyperviseur |
| 4 | **Mémoire et swap** | `avail Mem` : la mémoire réellement disponible, cache récupérable compris |
| 5 | **Processus** | `RES` mémoire physique, `%CPU`, `TIME+` temps processeur cumulé |

| Touche | Action |
|:-:|:--|
| **1** | Chaque cœur séparément |
| **P** / **M** | Trier par CPU / mémoire |
| **k** | Envoyer un signal |
| **c** | Ligne de commande complète |
| **u** | Processus d'un utilisateur |
| **q** | Quitter |

```bash title="bash"
# Mode batch : une seule mesure, triée par mémoire, exploitable dans un script
$ top -b -n 1 -o %MEM | head -15
```
