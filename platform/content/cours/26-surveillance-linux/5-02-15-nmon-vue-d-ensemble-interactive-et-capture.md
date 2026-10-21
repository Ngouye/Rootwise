| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Bilan complet en direct, ou enregistré en CSV | `nmon` (EPEL sur RHEL) | 🖥️ Terminal |

`nmon` (*Nigel's Performance Monitor*) réunit sur un même écran le CPU, la mémoire, les disques, le réseau, NFS,
les systèmes de fichiers et les processus les plus actifs. Il fonctionne en deux modes : **interactif**, pour
observer, et **capture**, pour enregistrer une période dans un fichier exploitable ensuite.

```bash title="bash"
$ sudo apt install nmon           # ou : sudo dnf install nmon (EPEL)
$ nmon                            # puis activer les vues au clavier
# Capture : 120 mesures toutes les 30 secondes (une heure)
$ nmon -f -s 30 -c 120
$ ls *.nmon
web01_260908_1015.nmon
```

| Touche | Vue |
|:--|:--|
| **c** / **l** | Utilisation du CPU par cœur / historique en graphique |
| **m** | Mémoire et swap |
| **d** | Disques : débit et occupation |
| **n** | Réseau : débit par interface |
| **t** | Processus les plus consommateurs |
| **h** / **q** | Aide / quitter |

> [!TIP] Exploiter une capture
> Le fichier `.nmon` est un CSV structuré. Des outils comme **NMON Analyser** (classeur Excel) ou **nmonchart**
> (page HTML) le transforment en graphiques : idéal pour documenter un test de charge ou un incident.
