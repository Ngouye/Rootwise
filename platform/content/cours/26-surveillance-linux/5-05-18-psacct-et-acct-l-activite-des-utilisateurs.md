| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Savoir qui a exécuté quoi, et combien de temps | `psacct` (RHEL) · `acct` (Debian) | ⚙️ Service |

La **comptabilité des processus** enregistre chaque commande terminée : nom, utilisateur, terminal, temps CPU.
Le paquet s'appelle `psacct` sur la famille Red Hat et `acct` sur Debian et Ubuntu ; les commandes sont
identiques.

```bash title="bash"
$ sudo dnf install psacct && sudo systemctl enable --now psacct   # RHEL & co
$ sudo apt install acct && sudo systemctl enable --now acct       # Debian/Ubuntu
$ ac -p                          # temps de connexion par utilisateur (heures)
        alice                               42.18
        root                                 3.75
        total       45.93
$ sudo lastcomm alice            # dernières commandes d'alice
bash             alice    pts/0      0.00 secs Tue Sep  8 10:21
vim              alice    pts/0      0.04 secs Tue Sep  8 10:19
$ sudo sa -m                     # par utilisateur : processus, CPU, E/S
```

| Commande | Rôle |
|:--|:--|
| `ac` | Temps de connexion (`-d` par jour, `-p` par utilisateur) |
| `lastcomm` | Dernières commandes exécutées, filtrables par utilisateur ou commande |
| `sa` | Synthèse des commandes : nombre d'appels, temps CPU (`-u`, `-m`) |
| `accton` | Activer ou désactiver la comptabilité manuellement |

> [!WARNING] Limites et cadre légal
> `lastcomm` n'enregistre que le **nom** des commandes, pas leurs arguments : pour un véritable audit, utilisez
> `auditd`. Dans tous les cas, **informez les utilisateurs** de cette surveillance, conformément au règlement
> intérieur et au RGPD.
