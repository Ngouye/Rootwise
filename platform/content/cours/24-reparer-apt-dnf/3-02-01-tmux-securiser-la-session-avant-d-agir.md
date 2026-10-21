| 🎯 Objectif | 🐧 Systèmes | 🚦 Risque |
|:--|:--|:--|
| Protéger la réparation d'une nouvelle coupure SSH | Tous | ⚪ Aucun |

Si vous intervenez à distance, ouvrez une session **tmux** avant toute réparation : une seconde coupure au
milieu d'un `dpkg --configure -a` aggraverait la situation. Dans tmux, les commandes **continuent de s'exécuter
sur le serveur** même si votre connexion tombe.

```bash title="bash"
# Ouvrir une session nommée
$ tmux new -s reparation
# Après une coupure : se reconnecter en SSH, puis rattacher la session
$ tmux attach -t reparation
# Installer tmux s'il est absent (et si le gestionnaire n'est pas verrouillé)
$ sudo apt install tmux
$ sudo dnf install tmux
```

> [!TIP] Astuces
> Pour détacher volontairement la session, tapez **Ctrl+B** puis **D**. Si apt est verrouillé, tmux ne pourra
> pas être installé : utilisez `screen` s'il est déjà présent.
