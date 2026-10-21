| 🎯 Objectif | 🧭 Contexte | 📶 Niveau |
|:--|:--|:--|
| Superviser tous les serveurs au même endroit | 🌐 Navigateur · app.pm2.io | 🔵 Pratique |

Quelques secondes après `pm2 link`, le serveur apparaît dans le bucket avec la liste de ses processus. Pour
chaque **serveur**, le tableau de bord indique la mémoire, le type de processeur et les versions de Node.js et de
PM2 ; pour chaque **processus**, son utilisation du processeur, sa mémoire et bien plus.

![Le bucket PROD-APIs sur app.pm2.io : deux serveurs en ligne, app01 et app02 (4 vCPU, 8 Go, Node 22.22, PM2 7.0.4), 3 exceptions en 24 h (TypeError: cannot read…), notifications par e-mail et Slack (mémoire de api au-delà de 250 Mo) ; tableau des processus api, api, worker et server-monit avec serveur, statut online, CPU, mémoire, redémarrages (2 pour worker) et tendance sur une heure](images/figure-07.webp "Figure 7 — Schéma d'un bucket : serveurs, processus et indicateurs (illustration, interface simplifiée).")

| Fonction | À quoi elle sert |
|:--|:--|
| **Métriques en temps réel** | Processeur, mémoire, latence HTTP, boucle d'événements, métriques tx2 |
| **Issues · exceptions** | Erreurs non gérées regroupées, avec la pile d'appels et leur fréquence |
| **Notifications** | Alertes par e-mail ou Slack sur seuil ou sur exception |
| **Actions** | Déclencher à distance un instantané mémoire, un profil processeur, un redémarrage |
| **Versions** | Branche et dernier commit Git quand l'application est un dépôt Git |
| **Historique** | Revenir sur une période passée ; la durée de conservation dépend de l'offre |

> [!TIP] Plusieurs serveurs, un seul écran
> Reliez tous les serveurs d'un projet au **même bucket**, en donnant à chacun un nom explicite (`app01`, `app02`,
> `worker01`…) : vous les comparez d'un coup d'œil et repérez immédiatement celui qui dévie.
