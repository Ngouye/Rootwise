![Partie 03](images/p18-bandeau-partie.webp)

L'expansion d'historique s'exécute **immédiatement** : un `!rm` mal ciblé peut coûter cher. Trois réflexes
rendent son usage sûr : **prévisualiser**, **protéger** les textes qui contiennent un `!`, et **ne jamais
compter** sur elle dans un script.

![Quatre réflexes : :p affiche sans exécuter, histverify fait relire avant Entrée, les guillemets simples ('S3cret!') protègent un ! littéral, set +H désactive l'expansion ; exemple : !rm:p affiche rm -rf /var/tmp/build-cache sans l'exécuter](images/p18-illustration-3.webp "Utiliser l'historique sans risque")

| Fiche | Syntaxe | Rôle |
|:-:|:--|:--|
| 09 | `:p` | Prévisualiser avant d'exécuter |
| 10 | `set +H` | Éviter l'erreur « event not found » |
| 11 | `histexpand` | Historique et scripts : ce qui marche |
