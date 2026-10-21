![Illustration 3D d'une salle de serveurs : deux rangées de baies lumineuses vertes se rejoignent vers un point de lumière](images/p03-illustration-2.webp "Illustration 3D · salle de serveurs")

« Le serveur est lent. » Derrière cette phrase se cache presque toujours une ressource saturée : un processeur
à bout de souffle, une mémoire qui déborde sur le swap, un disque qui ne suit plus ou un réseau engorgé. Le rôle
de l'administrateur est de **trouver laquelle, vite**, puis de vérifier que le problème ne revient pas.

Ce guide présente **24 outils** pour y parvenir, du classique `top` aux tableaux de bord web comme Netdata, en
passant par l'analyse des disques, du réseau, de l'activité des utilisateurs et de la sécurité. Chaque fiche
explique ce que l'outil mesure, comment l'installer, les commandes utiles et la façon d'interpréter ce qu'il
affiche.

> [!IMPORTANT] Commandes et sorties rétablies
> La traduction automatique de l'article d'origine a francisé des commandes (« # haut » pour `top`, « # hogs »
> pour `nethogs`, « au sommet » pour `atop`, « netstat -a | plus » pour `| more`, « pkg installer ») et les
> en-têtes des sorties (« gratuit », « dans », « nous » pour les colonnes `free`, `in`, `us` de vmstat). Ce guide
> rétablit tout en anglais, tel que vous le taperez et le lirez à l'écran. Deux erreurs de fond sont aussi
> corrigées : `vmstat` fait partie de **procps-ng**, pas de sysstat, et la méthode d'installation de Netdata est
> mise à jour.

## Objectifs du guide

- Savoir quel outil utiliser pour chaque ressource : CPU, mémoire, disques, réseau ;
- Interpréter correctement les chiffres : charge, attente d'E/S, latence disque, swap ;
- Passer du diagnostic en direct à l'historique et à la supervision avec alertes ;
- Adopter une méthode : les 60 premières secondes face à un serveur lent.

## Public et environnement

Ce guide s'adresse aux administrateurs systèmes et réseau, ingénieurs d'exploitation, SRE et candidats aux
certifications Linux. Les commandes sont données pour **Debian et Ubuntu** (apt) et pour la **famille Red Hat**
(dnf). Les outils absents des dépôts de base de RHEL, Rocky Linux et AlmaLinux se trouvent pour la plupart dans
**EPEL** (`sudo dnf install epel-release`).

## Conventions utilisées

| Notation | Signification |
|:--|:--|
| `$ sudo commande` | Commande nécessitant les privilèges administrateur (root) |
| `$ commande` | Commande utilisable sans privilège |
| *enp0s3*, *web01* | Interface et serveur d'exemple : remplacez-les par les vôtres |
| `# texte` | Commentaire explicatif dans un bloc de code |
| 🖥️ Terminal · ⚙️ Service · 🌐 Web | Type d'outil : interactif en terminal, service en arrière-plan ou interface web |

> [!NOTE] À propos des exemples
> Les sorties sont illustratives : valeurs, PID, adresses et versions varient d'un système à l'autre. Certaines,
> très larges, sont abrégées aux colonnes essentielles — c'est alors indiqué. Les adresses IP publiques utilisées
> sont des adresses réservées à la documentation.
