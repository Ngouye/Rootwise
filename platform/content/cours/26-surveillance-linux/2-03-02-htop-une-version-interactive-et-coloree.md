| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Explorer, filtrer et gérer les processus confortablement | `htop` (EPEL sur RHEL) | 🖥️ Terminal |

`htop` reprend les informations de `top` avec une interface bien plus confortable : **barres d'utilisation par
cœur**, défilement, recherche, vue arborescente et actions à la souris ou au clavier.

```bash title="bash"
$ sudo apt install htop          # Debian / Ubuntu
$ sudo dnf install htop          # Fedora ; EPEL sur RHEL, Rocky, AlmaLinux
$ htop -u www-data               # seulement les processus d'un utilisateur
$ htop -p 1873,2241              # surveiller des PID précis
$ htop -t                        # vue arborescente (parents et enfants)
```

| Touche | Action |
|:--|:--|
| **F3** ou **/** | Rechercher un processus par son nom |
| **F4** ou `\` | Filtrer la liste (seules les lignes correspondantes restent) |
| **F5** ou **t** | Basculer en vue arborescente |
| **F6** | Choisir la colonne de tri |
| **F9** ou **k** | Envoyer un signal au processus sélectionné |
| **F2** | Configurer l'affichage : colonnes, compteurs, couleurs |
| **Espace** | Marquer plusieurs processus pour agir sur tous à la fois |

> [!TIP] Couleurs des barres CPU
> Dans la barre d'un cœur, le **vert** représente le temps utilisateur, le **rouge** le temps noyau, le **bleu** les
> processus de basse priorité. Une barre très rouge oriente vers des appels système ou des pilotes ; une barre
> verte, vers le code des applications.
