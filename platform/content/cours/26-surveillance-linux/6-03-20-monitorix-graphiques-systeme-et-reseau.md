| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Visualiser l'historique d'un serveur dans le navigateur | `monitorix` | 🌐 Web |

**Monitorix** est un outil léger qui collecte régulièrement les mesures du système et des services, puis les
présente sous forme de **graphiques** via son propre serveur web : charge, mémoire, disques, températures, ports
réseau, statistiques de messagerie (Postfix, Dovecot), de MySQL, de Nginx, et bien d'autres.

```bash title="bash"
$ sudo apt install monitorix      # paquet de la distribution ou du projet
$ sudo systemctl enable --now monitorix
# Interface : http://adresse-du-serveur:8080/monitorix
```

```ini title="/etc/monitorix/monitorix.conf (extrait)"
<graph_enable>
    system  = y
    kern    = y
    fs      = y
    net     = y
    nginx   = y
    mysql   = n
</graph_enable>
```

Après chaque modification, redémarrez le service (`sudo systemctl restart monitorix`). Chaque module activé ajoute
une série de graphiques — jour, semaine, mois, année.

> [!CAUTION] Ne pas exposer l'interface
> Le serveur web intégré écoute par défaut sur le port **8080**. Restreignez l'accès dans la section
> `<httpd_builtin>` de la configuration (listes d'adresses autorisées et refusées) ou par le pare-feu, et ne le
> publiez **jamais** directement sur Internet.
