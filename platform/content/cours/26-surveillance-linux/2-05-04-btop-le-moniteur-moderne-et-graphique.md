| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Une vue globale lisible d'un seul coup d'œil | `btop` (EPEL sur RHEL) | 🖥️ Terminal |

`btop` est un moniteur de nouvelle génération : **graphiques en couleur** pour le CPU (par cœur), la mémoire, les
disques et le réseau, liste de processus filtrable et navigation fluide au clavier ou à la souris. C'est l'outil
idéal pour un écran de contrôle ou une première lecture rapide.

```bash title="bash"
$ sudo apt install btop          # Debian, Ubuntu récents
$ sudo dnf install btop          # Fedora ; EPEL sur RHEL, Rocky, AlmaLinux
$ sudo pacman -S btop            # Arch Linux
$ sudo pkg install btop          # FreeBSD
$ btop
```

| Touche | Action |
|:--|:--|
| **Échap** ou **m** | Ouvrir le menu (options, aide, quitter) |
| **1** à **4** | Afficher ou masquer les zones CPU, mémoire, réseau, processus |
| **f** | Filtrer la liste des processus |
| **e** | Basculer en vue arborescente |
| **Entrée** | Afficher le détail du processus sélectionné |
| **k** | Terminer le processus sélectionné |

> [!TIP] Thèmes et terminal
> `btop` utilise des caractères Unicode et 24 bits de couleur. Si l'affichage est dégradé (connexion SSH depuis un
> vieux terminal), activez l'option **TTY mode** dans le menu ou lancez `btop --tty_on`.
