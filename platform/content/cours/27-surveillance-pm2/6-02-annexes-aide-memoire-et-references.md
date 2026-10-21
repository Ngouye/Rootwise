Ces annexes rassemblent les informations à garder sous la main : aide-mémoire, référence des commandes, mise
en production, emplacement des fichiers, messages courants et glossaire.

## A. Aide-mémoire : « Je veux… »

| Je veux… | Commande |
|:--|:--|
| Voir l'état de toutes les applications | `pm2 ls` |
| Tout savoir sur une application | `pm2 show api` |
| Surveiller en direct dans le terminal | `pm2 monit` |
| Lire les 50 dernières erreurs | `pm2 logs api --err --lines 50` |
| Vider tous les journaux | `pm2 flush` |
| Relier le serveur à PM2 Plus | `pm2 link <secrète> <publique>` |
| Vérifier la connexion à PM2 Plus | `pm2 link info` |
| Détacher le serveur | `pm2 unlink` |
| Surveiller la machine | `pm2 install pm2-server-monit` |
| Retirer le module | `pm2 uninstall pm2-server-monit` |
| Recharger sans interruption (cluster) | `pm2 reload api` |
| Remettre les compteurs à zéro | `pm2 reset api` |

## B. Référence des commandes de supervision

| Commande | Rôle |
|:--|:--|
| `pm2 list` · `ls` · `status` | Liste des processus et des modules, avec la ligne `host metrics` |
| `pm2 show` · `describe` · `info` | Fiche détaillée et métriques de code d'un processus |
| `pm2 monit` · `dashboard` | Tableau de bord plein écran dans le terminal |
| `pm2 logs [nom]` | Journaux en direct (options `--lines`, `--err`, `--out`, `--json`) |
| `pm2 jlist` · `prettylist` | État de tous les processus en JSON, pour un script |
| `pm2 env <id>` | Variables d'environnement d'un processus |
| `pm2 reset <nom>` | Remettre à zéro les compteurs de redémarrage |
| `pm2 trigger <nom> <action>` | Déclencher une action (`km:heapdump`…) |
| `pm2 plus` · `link` · `unlink` | Créer un compte, relier, détacher PM2 Plus |
| `pm2 install` · `uninstall` | Ajouter ou retirer un module |
| `pm2 set` · `conf` | Modifier ou lire la configuration d'un module |

## C. Mise en production : garder la supervision active

```bash title="bash"
$ pm2 startup                            # affiche la commande sudo à exécuter
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup \
    systemd -u deploy --hp /home/deploy
$ pm2 save                               # mémorise la liste des processus
[PM2] Successfully saved in /home/deploy/.pm2/dump.pm2
$ pm2 install pm2-logrotate              # rotation automatique des journaux
$ pm2 set pm2-logrotate:max_size 50M
$ pm2 set pm2-logrotate:retain 14        # garder 14 fichiers par journal
```

> [!TIP] Après chaque changement
> Relancez `pm2 save` chaque fois que vous ajoutez ou supprimez une application : au démarrage, PM2 restaure
> **exactement** la liste enregistrée.

## D. Fichiers et emplacements

| Chemin | Contenu |
|:--|:--|
| `~/.pm2/logs/` | Journaux : `nom-out.log` et `nom-error.log` (suffixe `-N` en cluster) |
| `~/.pm2/pids/` | Fichiers PID des processus |
| `~/.pm2/dump.pm2` | Liste sauvegardée par `pm2 save` |
| `~/.pm2/modules/` | Modules installés (`pm2-server-monit`…) |
| `~/.pm2/module_conf.json` | Réglages des modules (`pm2 set`) |
| `~/.pm2/agent.json5` | Configuration de l'agent PM2 Plus |
| `~/.pm2/agent.log` | Journal de l'agent PM2 Plus |
| `~/.pm2/pm2.log` | Journal du démon PM2 lui-même |

## E. Messages courants et dépannage

| Message ou symptôme | Cause et solution |
|:--|:--|
| Statut `errored`, ↺ élevé | Plantages en boucle : `pm2 logs nom --err` |
| `EADDRINUSE: address already in use` | Port déjà utilisé : changer `PORT` ou arrêter l'autre processus |
| `Not managed to connect to PM2 Plus` | Sortie HTTPS bloquée ou clés erronées : voir `~/.pm2/agent.log` |
| `Interactor is offline` | Agent arrêté ou serveur non relié : `pm2 link` |
| Liste vide avec `sudo pm2 ls` | Chaque utilisateur a son démon : lancer sans `sudo` |
| `pm2: command not found` avec `sudo` | PATH réduit par sudo : utiliser la commande donnée par `pm2 startup` |
| Métrique absente de `pm2-server-monit` | Non prise en charge sur la plateforme : `pm2 logs pm2-server-monit` |

## F. Glossaire

| Terme | Définition |
|:--|:--|
| **Démon PM2** | Processus d'arrière-plan qui lance, relance et mesure les applications |
| **Mode fork · cluster** | Un processus isolé · plusieurs instances qui se partagent le même port |
| **Fichier ecosystem** | Fichier de configuration (`ecosystem.config.js`) décrivant les applications |
| **Module PM2** | Extension installée avec `pm2 install` et exécutée comme un processus |
| **PM2 Plus** | Service web de supervision des créateurs de PM2 (app.pm2.io) |
| **Bucket** | Espace PM2 Plus qui regroupe les serveurs d'un projet et porte l'abonnement |
| **Agent** | Composant qui transmet les données du serveur à PM2 Plus |
| **Métrique personnalisée** | Indicateur publié par l'application elle-même (tx2) |
| **Boucle d'événements** | Mécanisme qui exécute le code JavaScript ; son retard signale une saturation |
| **Processus zombie** | Processus terminé dont le parent n'a pas encore lu le code de retour |

## G. Sources et références

- Aaron Kili, « Comment surveiller les applications Node.js à l'aide du tableau de bord web PM2 », *Tecmint*
  (tecmint.com), mis à jour le 7 octobre 2020. Article dont ce guide reprend la démarche, qu'il corrige et
  enrichit.
- Documentation PM2 (pm2.keymetrics.io) : « Process Metrics », « What's New » ; documentation PM2 Plus
  (pm2.io/docs/plus/quick-start) ; page Tarifs, consultée en octobre 2026.
- Journal des modifications de PM2 7.0.4 et documentation du module `pm2-server-monit`.
- Exemples vérifiés avec PM2 7.0.4, Node.js 22, `pm2-server-monit` 3.0.0 et `pm2-logrotate` 3.0.0.
