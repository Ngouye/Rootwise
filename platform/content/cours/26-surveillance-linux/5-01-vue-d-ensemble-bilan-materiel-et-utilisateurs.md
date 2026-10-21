![Partie 04](images/p26-bandeau-partie.webp)

Certains outils embrassent **toutes les ressources à la fois**, d'autres regardent le **matériel** ou les
**utilisateurs**. Ils servent à dresser un bilan, à enregistrer une période de charge ou à comprendre qui fait
quoi.

![Bilan, matériel et utilisateurs : nmon (tout sur un écran), collectl (corréler les mesures), s-tui (fréquence et chaleur), psacct (activité des comptes) ; enregistrer une heure de charge pour l'analyser ensuite : nmon -f -s 30 -c 120 produit le fichier web01_260908_1015.nmon](images/p26-illustration-3.webp "Bilan, matériel et utilisateurs")

| Fiche | Outil | Rôle |
|:-:|:--|:--|
| 15 | `nmon` | Vue d'ensemble interactive et capture |
| 16 | `collectl` | Collecte multi-ressources en continu |
| 17 | `s-tui` | Fréquence, température et test de charge |
| 18 | `psacct` / `acct` | L'activité des utilisateurs |
