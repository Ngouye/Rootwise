| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `ethtool` | root recommandé (lecture complète et modification) | 🔵 Actif |

`ethtool` interroge et modifie les paramètres du contrôleur d'interface réseau (NIC) et de son pilote : vitesse,
duplex, auto-négociation, détection du lien, statistiques matérielles et fonctions de déchargement (*offload*).
C'est l'outil idéal pour diagnostiquer un problème de **couche physique** : câble défectueux, lien négocié à
100 Mb/s au lieu de 1 Gb/s, port mal identifié…

```bash title="bash"
$ sudo ethtool enp1s0
Settings for enp1s0:
        Supported link modes:   10baseT/Half 10baseT/Full
                                100baseT/Half 100baseT/Full
                                1000baseT/Full
        Speed: 1000Mb/s
        Duplex: Full
        Auto-negotiation: on
        Port: Twisted Pair
        Link detected: yes
```

| Commande | Résultat |
|:--|:--|
| `ethtool -i enp1s0` | Pilote, version et firmware de la carte |
| `ethtool -S enp1s0` | Statistiques détaillées du pilote (erreurs, pertes, CRC) |
| `ethtool -k enp1s0` | Fonctions de déchargement (offload) actives |
| `ethtool -p enp1s0 10` | Fait clignoter la LED du port pendant 10 s pour l'identifier physiquement |
| `ethtool -s enp1s0 speed 1000 duplex full autoneg off` | Forcer la vitesse et le mode duplex |

> [!TIP] Diagnostic rapide
> La ligne `Link detected: yes/no` confirme immédiatement si le lien physique est établi : c'est la **première
> vérification** à faire lorsqu'une machine « ne voit plus le réseau ».
