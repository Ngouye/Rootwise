| 🎯 Objectif | 🧭 Contexte | 📶 Niveau |
|:--|:--|:--|
| Vérifier d'un coup d'œil que tout tourne | 💻 Ligne de commande | 🟢 Essentiel |

`pm2 list` — ou ses alias `pm2 ls` et `pm2 status` — dresse l'inventaire des processus gérés par PM2. C'est la
**première commande à taper** pour savoir si tout va bien. Depuis PM2 7, le tableau s'adapte à la largeur du
terminal et se termine par une ligne `host metrics` qui résume la charge du serveur.

```bash title="bash"
$ pm2 ls
┌────┬──────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name     │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼──────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 1  │ api      │ cluster  │ 0    │ online    │ 0%       │ 60.4mb   │
│ 2  │ api      │ cluster  │ 0    │ online    │ 0%       │ 60.2mb   │
│ 3  │ worker   │ fork     │ 15   │ errored   │ 0%       │ 0b       │
└────┴──────────┴──────────┴──────┴───────────┴──────────┴──────────┘
host metrics | cpu: 0% | ram usage: 8.3%
```

![Les colonnes de pm2 list : 1. name, le nom donné avec --name ; 2. mode, fork ou cluster (N instances) ; 3. ↺, les redémarrages, qui doivent rester stables ; 4. status, online, stopped, errored… ; 5. cpu et memory, la consommation instantanée ; la ligne worker (fork, 15 redémarrages, errored) est encadrée en rouge](images/figure-03.webp "Figure 3 — Les colonnes à surveiller en priorité dans pm2 list.")

| Statut | Signification |
|:--|:--|
| `online` | Le processus tourne normalement |
| `stopped` | Arrêté volontairement (`pm2 stop`) |
| `launching` | En cours de démarrage |
| `errored` | PM2 a renoncé après trop de plantages successifs : consultez les journaux (fiche 05) |

> [!WARNING] Le compteur ↺ ne ment pas
> Un nombre de redémarrages (↺) qui grimpe signale une application qui **plante en boucle**, même si son statut
> reste `online` entre deux plantages. Dans l'exemple, `worker` tente d'écouter un port déjà utilisé par `api` et
> finit en `errored`.
