![Partie 06](images/p32-bandeau-partie.webp)

Sous Linux, le filtrage des paquets est assuré dans le noyau par le framework **Netfilter**. Les outils présentés
ici sont des interfaces pour en définir les règles. Règle d'or : **n'utilisez qu'un seul gestionnaire de pare-feu à
la fois** sur un même serveur.

![Filtrage du trafic entrant : le pare-feu Netfilter évalue ses règles dans l'ordre — ACCEPT 22/tcp (SSH), ACCEPT 443/tcp (HTTPS), DROP 23/tcp (Telnet), DROP tout le reste —, si bien que seuls SSH et HTTPS atteignent srv01 ; outils : iptables / nft, firewalld, ufw](images/p32-illustration-3.webp "Filtrage du trafic entrant")

| Fiche | Outil | Rôle |
|:-:|:--|:--|
| 20 | `iptables` | Règles Netfilter (filtrage, NAT) |
| 21 | `firewalld` | Pare-feu dynamique par zones |
| 22 | `ufw` | Pare-feu simplifié |

## Repères

| Outil | Approche | Distributions | Niveau |
|:--|:--|:--|:--|
| `iptables` | Chaînes et règles explicites | Toutes | Avancé |
| `firewalld` | Zones et services, rechargement à chaud | RHEL, Fedora, Rocky, Alma | Intermédiaire |
| `ufw` | Règles simplifiées, syntaxe lisible | Ubuntu, Debian | Débutant |
| `nft` | Successeur d'iptables, souvent utilisé en arrière-plan | Toutes (récentes) | Avancé |
