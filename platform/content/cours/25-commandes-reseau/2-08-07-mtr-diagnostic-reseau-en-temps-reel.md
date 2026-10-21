| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `mtr` (`mtr-tiny` : version console) | Utilisateur | 🔵 Actif |

`mtr` (*My Traceroute*) combine les fonctions de `ping` et de `traceroute` dans un seul outil moderne. Il sonde
**en continu** chaque saut du chemin et met à jour en temps réel le taux de perte et la latence de chacun, jusqu'à
ce que vous quittiez le programme avec la touche **q**. C'est l'outil privilégié pour identifier un lien instable ou
une perte de paquets intermittente.

```bash title="bash"
# Mode interactif (nom d'hôte ou adresse IP)
$ mtr example.com
# Mode rapport : 10 cycles, sortie large, puis arrêt automatique
$ mtr -rw -c 10 example.com
HOST: srv01                Loss%   Snt   Last   Avg  Best  Wrst StDev
  1.|-- 192.168.1.1         0.0%    10    0.5   0.6   0.4   1.7   0.4
  2.|-- 10.24.0.1           0.0%    10    1.9   1.5   0.8   7.3   1.9
  3.|-- ???                100.0    10    0.0   0.0   0.0   0.0   0.0
  4.|-- 198.51.100.9        0.0%    10    9.1   8.2   7.2  11.8   1.2
  5.|-- 203.0.113.50        0.0%    10   12.0  12.3  11.4  13.1   0.4
```

| Colonne | Signification |
|:--|:--|
| `Loss%` | Pourcentage de paquets perdus sur ce saut |
| `Snt` | Nombre de paquets envoyés |
| `Last` / `Avg` | Dernière latence mesurée / latence moyenne (en ms) |
| `Best` / `Wrst` | Meilleure et pire latence observées |
| `StDev` | Écart-type : une valeur élevée signale une latence instable (gigue) |

> [!NOTE] Interpréter les pertes
> Une perte sur un saut intermédiaire qui ne se répercute pas sur les sauts suivants vient généralement d'un
> routeur qui limite ses réponses ICMP. **Seule la perte observée jusqu'à la destination finale est réellement
> significative.**
