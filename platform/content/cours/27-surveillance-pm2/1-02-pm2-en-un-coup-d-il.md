PM2 tourne en arrière-plan sous la forme d'un **démon** : il lance vos applications, les relance si elles
s'arrêtent et mesure en permanence leur consommation. Toutes les commandes `pm2` dialoguent avec ce démon.

![Trois niveaux de supervision : dans le terminal, intégré à PM2 et gratuit (pm2 ls, pm2 show, pm2 monit, pm2 logs : l'instant présent, un serveur à la fois, rien à installer) ; le tableau de bord web PM2 Plus, sur abonnement (pm2 link, pm2 unlink, app.pm2.io : plusieurs serveurs, historique et alertes, exceptions regroupées) ; les ressources du serveur avec le module gratuit pm2-server-monit (pm2 set : processeur, mémoire, disque, processus et sessions SSH, dans le terminal ou PM2 Plus)](images/figure-01.webp "Figure 1 — Trois niveaux de supervision, du terminal au tableau de bord web.")

> [!TIP] Lequel choisir ?
> Un seul serveur : le terminal suffit (`pm2 monit`). Plusieurs serveurs, besoin d'historique ou d'alertes :
> **PM2 Plus**. Dans les deux cas, `pm2-server-monit` ajoute les métriques du serveur lui-même.

## Comment les données circulent

![Sur le serveur app01, le démon PM2 lance, relance et mesure les processus api (cluster #1 et #2), worker (fork) et le module pm2-server-monit ; pm2 ls, show, monit et logs l'interrogent ; après pm2 link, l'agent PM2 Plus transmet les données en HTTPS sortant au bucket PROD-APIs de PM2 Plus, consulté dans le navigateur sur app.pm2.io ; aucun port entrant à ouvrir](images/figure-02.webp "Figure 2 — Le démon PM2 mesure les processus ; l'agent transmet les données au tableau de bord.")

**Aucune donnée ne quitte le serveur** tant que vous n'avez pas exécuté `pm2 link`. L'agent ouvre alors une
connexion **sortante et chiffrée** vers PM2 Plus : il n'est pas nécessaire d'ouvrir un port entrant sur le pare-feu.

| Élément | Rôle | Où l'observer |
|:--|:--|:--|
| **Démon PM2** | Lance, relance et mesure les processus | `pm2 list`, `pm2 monit` |
| **Agent PM2 Plus** | Transmet les métriques au tableau de bord | `pm2 link info`, `~/.pm2/agent.log` |
| **Modules** | Extensions gérées par PM2 : `pm2-server-monit`, `pm2-logrotate`… | `pm2 list`, section Module |
| **Tableau de bord** | Plusieurs serveurs, historique, alertes | app.pm2.io |

## Les 13 usages du cours

| N° | Commande | Rôle | Où ? | Niveau |
|:-:|:--|:--|:--|:--|
| 01 | `pm2 start` | Lancer et nommer l'application | 💻 Terminal | 🟢 Essentiel |
| 02 | `pm2 list` | Lire l'état des processus | 💻 Terminal | 🟢 Essentiel |
| 03 | `pm2 show` | Inspecter un processus en détail | 💻 Terminal | 🔵 Pratique |
| 04 | `pm2 monit` | Le tableau de bord du terminal | 💻 Terminal | 🟢 Essentiel |
| 05 | `pm2 logs` | Suivre les journaux en direct | 💻 Terminal | 🟢 Essentiel |
| 06 | `tx2` | Publier des métriques personnalisées | 🧩 Code | 🟣 Avancé |
| 07 | app.pm2.io | Créer un compte et un bucket | 🌐 Web | 🔵 Pratique |
| 08 | `pm2 link` | Relier le serveur à PM2 Plus | 💻 Terminal | 🟢 Essentiel |
| 09 | Tableau de bord | Lire le tableau de bord web | 🌐 Web | 🔵 Pratique |
| 10 | `pm2 unlink` | Détacher un serveur | 💻 Terminal | 🔵 Pratique |
| 11 | `pm2 install` | Installer `pm2-server-monit` | 💻 Terminal | 🟢 Essentiel |
| 12 | `pm2 set` | Régler le module | 💻 Terminal | 🟣 Avancé |
| 13 | `pm2 uninstall` | Retirer un module | 💻 Terminal | 🔵 Pratique |

🟢 **Essentiel** : dès le premier jour · 🔵 **Pratique** : usage régulier · 🟣 **Avancé** : production et cas particuliers
