| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Savoir avec qui le serveur échange, et à quel débit | `iftop` (EPEL sur RHEL) | 🖥️ Terminal |

`iftop` est au réseau ce que `top` est au processeur : il affiche en continu les **couples d'hôtes** qui échangent
le plus de données sur une interface, avec leur débit moyen sur 2, 10 et 40 secondes.

```bash title="bash"
$ sudo iftop -i enp0s3 -nNP
              12.5Mb        25.0Mb        37.5Mb        50.0Mb        62.5Mb
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────
192.168.0.10:443   => 203.0.113.45:52114        8.42Mb  6.10Mb  5.87Mb
                   <=                            312Kb   287Kb   264Kb
192.168.0.10:22    => 198.51.100.7:50422        12.4Kb  10.8Kb  9.66Kb
                   <=                           1.84Kb  1.62Kb  1.55Kb
──────────────────────────────────────────────────────────────────────
TX:      cum:  48.2MB   peak:  9.12Mb   rates:  8.43Mb  6.11Mb  5.88Mb
RX:             1.71MB           420Kb           314Kb   289Kb   266Kb
TOTAL:         49.9MB           9.48Mb          8.74Mb  6.40Mb  6.15Mb
```

| Option ou touche | Effet |
|:--|:--|
| `-n` / `-N` | Ne pas résoudre les adresses / les numéros de port |
| `-P` | Afficher les ports (indispensable pour identifier un service) |
| `-f 'port 443'` | Appliquer un filtre au format tcpdump |
| `-B` | Afficher en octets plutôt qu'en bits |
| **p** / **s** / **d** | En direct : ports, masquer la source, masquer la destination |
| **t** | Changer de mode : deux lignes, une ligne, émission ou réception seule |

> [!NOTE] Lire les trois colonnes
> Les trois valeurs de droite sont des moyennes sur **2, 10 et 40 secondes**. Un pic ponctuel apparaît d'abord dans
> la première ; un transfert soutenu se retrouve dans les trois.
