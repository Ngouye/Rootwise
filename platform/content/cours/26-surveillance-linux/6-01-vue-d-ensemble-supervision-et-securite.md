![Partie 05](images/p31-bandeau-partie.webp)

Les outils interactifs exigent que vous soyez devant l'écran. La **supervision**, elle, surveille en permanence,
conserve l'historique, redémarre ce qui tombe et vous alerte — y compris en cas d'activité réseau suspecte.

![De la mesure à l'alerte : les serveurs web01, db01 et app01 remontent leurs mesures à la supervision (Nagios, Netdata, Monitorix, Monit : collecte, historique, seuils), qui déclenche une alerte (e-mail, messagerie), alimente un tableau de bord (historique en graphiques) ou agit (redémarrage automatique) ; sécurité du réseau : arpwatch surveille les couples IP / MAC, Suricata détecte les intrusions](images/p31-illustration-3.webp "De la mesure à l'alerte")

| Fiche | Outil | Rôle |
|:-:|:--|:--|
| 19 | Monit | Surveiller et redémarrer les services |
| 20 | Monitorix | Graphiques système et réseau |
| 21 | Netdata | Tableau de bord temps réel |
| 22 | Nagios | Supervision de parc avec alertes |
| 23 | `arpwatch` | Surveiller les couples IP / MAC |
| 24 | Suricata | Détection d'intrusions réseau |
