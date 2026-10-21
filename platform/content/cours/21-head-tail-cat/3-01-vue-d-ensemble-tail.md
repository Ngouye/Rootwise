![Partie 02](images/p11-bandeau-partie.webp)

`tail` affiche la **fin** d'un fichier — par défaut ses 10 dernières lignes — et sait surtout le **suivre en
temps réel**. C'est l'outil de base de tout dépannage : on relance un service, on observe son journal, on
comprend.

![Le fichier /var/log/syslog, en cours d'écriture : ses dernières lignes (requêtes de app[3310]) apparaissent en direct dans un terminal qui exécute sudo tail -F /var/log/syslog ; en dessous, les variantes tail -n 50, tail -f, tail -F et journalctl -f](images/p11-illustration-3.webp "Les événements récents, en temps réel — Ctrl+C pour arrêter")

| Fiche | Syntaxe | Rôle |
|:-:|:--|:--|
| 06 | `tail` | Afficher les 10 dernières lignes |
| 07 | `tail -n` | Choisir le nombre de lignes |
| 08 | `tail -f` | Suivre un journal en temps réel |
| 09 | `tail -F` | Survivre à la rotation des journaux |
| 10 | `tail -n +N` | Afficher à partir de la ligne N |
| 11 | `tail -c` | Lire les derniers octets |
| 12 | `journalctl -f` | L'équivalent pour journald |
