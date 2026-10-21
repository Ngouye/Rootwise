| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Détecter file d'attente, swap et attente d'E/S | `procps-ng` (préinstallé) | 🖥️ Terminal |

`vmstat` affiche, ligne après ligne, l'état de la **file d'exécution**, de la **mémoire**, du **swap**, des **E/S** et
du **processeur**. Contrairement à ce qu'indiquait l'article d'origine, il n'est pas fourni par sysstat mais par
**procps-ng**, installé par défaut.

```bash title="bash"
$ vmstat 2 4                      # une mesure toutes les 2 s, 4 fois
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  0  16896 934512  98212 3797340    0    0    12    48  215  402  6  2 91  1  0
 3  0  16896 931204  98212 3797652    0    0     0   214  812 1530 14  4 81  1  0
 2  1  16896 929876  98220 3797788    0    0  1840   536  954 1711 12  5 70 13  0
 6  2  16896 927452  98220 3798012    0    0  2312   604 1033 1902 18  6 52 24  0
```

![Les colonnes de vmstat : procs (r, 6 en cours ; b, 2 bloqués), memory (swpd, free, buff, cache), swap (si et so : entrées et sorties), io (bi, bo), system (in, cs) et cpu (us, sy, id, wa à 24 en attente, st volé) ; file d'exécution : r supérieur au nombre de cœurs signale un CPU saturé, b durablement supérieur à 0 des processus bloqués ; swap actif : si et so différents de 0 en continu, la mémoire vive ne suffit plus ; attente et temps volé : wa élevé, stockage trop lent, st supérieur à 0, hyperviseur surchargé](images/figure-04.webp "Figure 4 — Les colonnes de vmstat qui signalent un problème.")

> [!IMPORTANT] Ignorez la première ligne
> La première ligne affiche des **moyennes depuis le démarrage** : elle ne reflète pas l'instant présent. Ne lisez
> que les lignes suivantes. Pour la mémoire, complétez avec `free -h` et regardez la colonne `available`, qui
> tient compte du cache récupérable.
