| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Repérer la ressource saturée et revoir le passé | `atop` (EPEL sur RHEL) | 🖥️ Terminal |

`atop` va plus loin que `top` : il affiche pour chaque processus l'usage du CPU, de la mémoire, du disque et du
réseau, et **colore en rouge** les ressources proches de la saturation. Surtout, son service **enregistre l'état
du système** à intervalles réguliers : vous pouvez revoir ce qui s'est passé à 3 h du matin.

```bash title="bash"
$ sudo apt install atop                   # ou : sudo dnf install atop (EPEL)
$ sudo systemctl enable --now atop        # journalisation continue
$ atop 5                                  # affichage interactif, rafraîchi toutes les 5 s
# Rejouer l'enregistrement d'une journée
$ atop -r /var/log/atop/atop_20260908
```

| Touche | Vue ou action |
|:--|:--|
| **g** | Vue générique (par défaut) |
| **m** / **d** / **n** | Détail mémoire / disque / réseau par processus (**n** nécessite netatop) |
| **c** | Ligne de commande complète |
| **p** / **u** | Cumuler par programme / par utilisateur |
| **t** / **T** | En mode lecture (`-r`) : mesure suivante / précédente |
| **b** | En mode lecture : aller directement à une heure (ex. 03:00) |

> [!WARNING] Espace disque des journaux
> Les fichiers de `/var/log/atop/` sont conservés plusieurs semaines selon la configuration (`/etc/default/atop`
> sur Debian, `/etc/sysconfig/atop` sur RHEL : intervalle et durée de rétention). Ajustez-les sur les petits
> disques.
