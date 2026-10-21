![Partie 03](images/p17-bandeau-partie.webp)

Les groupes ouvrent l'accès à `sudo`, à Docker, aux dossiers partagés et à de nombreux services. C'est
aussi là que se produisent les erreurs les plus coûteuses : une liste de groupes écrasée par un `-G` sans
`-a`.

![alice (uid=1001) a un groupe principal, editeurs (usermod -g : un seul, hérité par les fichiers créés), et des groupes secondaires sudo, adm et docker, ajouté par usermod -aG docker alice, tandis que projet-x est retiré par usermod -rG projet-x alice ; un avertissement rappelle : jamais -G seul, qui remplace toute la liste et ferait perdre sudo et adm](images/p17-illustration-3.webp "Groupe principal et groupes secondaires")

| Fiche | Syntaxe | Rôle |
|:-:|:--|:--|
| 06 | `usermod -g` | Changer le groupe principal |
| 07 | `usermod -aG` | Ajouter des groupes secondaires |
| 08 | `usermod -rG` | Retirer un groupe secondaire |
