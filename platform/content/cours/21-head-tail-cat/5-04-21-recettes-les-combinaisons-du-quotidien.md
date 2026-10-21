| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Résoudre les besoins courants en une ligne | Toutes distributions (GNU coreutils) | 🔵 Pratique |

| Besoin | Commande |
|:--|:--|
| Voir l'en-tête d'un CSV | `head -n 1 ventes.csv` |
| Afficher un CSV sans son en-tête | `tail -n +2 ventes.csv` |
| Vérifier la dernière ligne d'un fichier | `tail -n 1 fichier` |
| Suivre un journal en filtrant les erreurs | `sudo tail -F /var/log/syslog \| grep --line-buffered -i error` |
| Suivre un journal en pouvant remonter | `sudo less +F /var/log/syslog` |
| Lire un journal du plus récent au plus ancien | `sudo tac /var/log/syslog \| less` |
| Compter les lignes d'un fichier | `wc -l fichier` |
| Configuration sans commentaires ni lignes vides | `grep -Ev '^\s*(#\|$)' /etc/ssh/sshd_config` |
| Repérer des fins de ligne Windows | `cat -A fichier \| grep -c '\^M\$'` |
| Lignes 100 à 120 d'un gros fichier | `sed -n '100,120p;120q' fichier` |

> [!TIP] `less +F`
> `less +F` suit un fichier comme `tail -f` ; **Ctrl+C** suspend le suivi pour remonter et rechercher
> (`/motif`), puis **F** le relance. C'est le meilleur des deux mondes pour analyser un journal actif.
