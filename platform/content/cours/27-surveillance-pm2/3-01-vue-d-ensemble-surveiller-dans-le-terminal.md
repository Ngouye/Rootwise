![Partie 02](images/p12-bandeau-partie.webp)

Sans quitter la ligne de commande, PM2 affiche **en temps réel** la charge de chaque processus, ses journaux et
les indicateurs que vous choisissez d'exposer. Idéal pour un serveur unique ou un diagnostic rapide.

![Surveiller dans le terminal : pm2 monit et ses quatre panneaux en direct (liste des processus, journaux de api avec un avertissement de requête lente à 812 ms, métriques personnalisées req/sec et Heap Usage, métadonnées), pm2 logs --err pour les erreurs sans attendre, tx2 pour vos propres métriques](images/p12-illustration-3.webp "Surveiller dans le terminal")

| Fiche | Commande | Rôle |
|:-:|:--|:--|
| 04 | `pm2 monit` | Le tableau de bord du terminal |
| 05 | `pm2 logs` | Suivre les journaux en direct |
| 06 | `tx2` | Publier des métriques personnalisées |
