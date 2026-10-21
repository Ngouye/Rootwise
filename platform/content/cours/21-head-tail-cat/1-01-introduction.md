![Illustration 3D d'un poste d'administration : un terminal affiche top, tail -f sur le journal nginx, iostat et ss, à côté de deux écrans de supervision (CPU, mémoire, disque, réseau)](images/p03-illustration-2.webp "Illustration 3D · poste d'administration")

Chaque système Linux — machine virtuelle dans le cloud, serveur physique ou conteneur — produit en
permanence des fichiers texte : configurations, journaux, exports CSV, comptes rendus de déploiement,
traces de tâches cron. Savoir les lire et les examiner **en quelques secondes**, sans ouvrir d'éditeur ni
écrire de script, est l'une des compétences les plus rentables de la ligne de commande.

Pourtant, la plupart des administrateurs n'utilisent `cat` que pour afficher un fichier, et `tail -f` que
pour suivre un journal. Les trois commandes de ce guide existent depuis les débuts d'Unix, mais une bonne
partie de leurs possibilités reste méconnue :

- `head` sait afficher **tout sauf les N dernières lignes** d'un fichier, et pas seulement les premières ;
- `tail` peut suivre un journal **par son nom**, et survivre ainsi à la rotation des journaux ;
- `cat` **révèle les caractères invisibles** — tabulations, fins de ligne Windows — qui font échouer des
  scripts sans raison apparente.

## Objectifs du guide

- Lire rapidement le début, la fin ou une portion précise d'un fichier ;
- Surveiller des journaux en temps réel, y compris pendant une rotation et avec journald ;
- Créer, assembler et diagnostiquer des fichiers avec `cat`, les redirections et les heredocs ;
- Combiner ces commandes avec les tubes et les autres outils texte (`grep`, `sed`, `awk`, `less`).

## Prérequis et environnement

Une connaissance de base du terminal et de la navigation dans l'arborescence suffit. Les exemples sont
présentés pour **Ubuntu et Debian** ; les différences avec **RHEL, Rocky Linux et AlmaLinux** — notamment
l'emplacement des journaux — sont signalées. Les droits root ne sont nécessaires que pour lire certains
journaux système : `sudo` est alors indiqué.

## Conventions utilisées

| Notation | Signification |
|:--|:--|
| `$ commande` | Commande exécutée par un utilisateur standard |
| `$ sudo commande` | Commande nécessitant les privilèges administrateur (root) |
| *fichier*, *N* | Nom de fichier ou nombre à remplacer par votre propre valeur |
| `# texte` | Commentaire explicatif dans un bloc de code |
| 🟢 Essentiel · 🔵 Pratique · 🟣 Avancé | Niveau de chaque fiche : à connaître par cœur, d'usage courant, astuce d'expert |

> [!NOTE] À propos des exemples
> Les sorties présentées sont illustratives (machine `srv01`). Selon la configuration de rsyslog,
> l'horodatage des journaux peut apparaître au format classique (`Aug 24 15:55:01`) ou au format ISO 8601
> (`2026-08-24T15:55:01.529373+02:00`) ; les commandes, elles, fonctionnent à l'identique.
