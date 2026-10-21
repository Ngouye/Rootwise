`head` lit le **début** d'un fichier, `tail` sa **fin** — et le suit en temps réel —, `cat` l'affiche **en
entier** ou l'assemble avec d'autres. Combinées entre elles, ou avec `tac` et `sed`, elles extraient
n'importe quelle portion d'un fichier.

![Six colonnes représentent le même fichier de 20 lignes ; les lignes affichées sont colorées : head -n 5 garde les lignes 1 à 5, head -n -5 les lignes 1 à 15, tail -n 5 les lignes 16 à 20, tail -n +6 les lignes 6 à 20, sed -n '8,12p' les lignes 8 à 12, et tac affiche les 20 lignes de la dernière à la première](images/figure-01.webp "Figure 1 — Sur un fichier de 20 lignes : la portion affichée par chaque commande.")

## Référence rapide

| Commande | Résultat | Niveau |
|:--|:--|:--|
| `head fichier` | Les 10 premières lignes | 🟢 Essentiel |
| `head -n 20 fichier` | Les 20 premières lignes | 🟢 Essentiel |
| `head -n -5 fichier` | Tout sauf les 5 dernières lignes | 🟣 Avancé |
| `head -c 100 fichier` | Les 100 premiers octets | 🔵 Pratique |
| `tail fichier` | Les 10 dernières lignes | 🟢 Essentiel |
| `tail -n +2 fichier` | De la ligne 2 jusqu'à la fin | 🔵 Pratique |
| `tail -f fichier` | Suivre les ajouts en temps réel | 🟢 Essentiel |
| `tail -F fichier` | Suivre par nom, malgré la rotation des journaux | 🟣 Avancé |
| `journalctl -u service -f` | Suivre le journal d'un service systemd | 🔵 Pratique |
| `cat fichier` | Afficher tout le fichier | 🟢 Essentiel |
| `cat f1 f2 > f3` | Concaténer dans un nouveau fichier | 🟢 Essentiel |
| `cat -n fichier` | Numéroter les lignes | 🔵 Pratique |
| `cat -A fichier` | Révéler tabulations et fins de ligne | 🟣 Avancé |
| `tac fichier` | Afficher les lignes en ordre inverse | 🔵 Pratique |
| `sed -n '20,30p' fichier` | Afficher les lignes 20 à 30 | 🔵 Pratique |

🟢 **Essentiel** : à connaître par cœur · 🔵 **Pratique** : d'usage courant · 🟣 **Avancé** : astuce d'expert

> [!IMPORTANT] À retenir
> Avant d'ouvrir un gros fichier dans un éditeur, regardez-en d'abord le début avec `head` ou la fin avec
> `tail` : c'est instantané, même sur un journal de plusieurs gigaoctets, et sans aucun risque de
> modification accidentelle.
