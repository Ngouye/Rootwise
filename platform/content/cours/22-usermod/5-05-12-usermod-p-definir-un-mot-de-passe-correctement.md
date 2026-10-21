| 🎯 Objectif | 📁 Fichiers modifiés | 🚦 Risque |
|:--|:--|:--|
| Écrire un mot de passe sans l'exposer | `/etc/shadow` (champ 2) | 🔴 Élevé |

L'option `-p` attend un mot de passe **déjà haché**, jamais du texte en clair. `sudo usermod -p secret bob`
écrit littéralement « secret » dans `/etc/shadow` : la commande semble réussir, mais l'utilisateur ne pourra
jamais se connecter avec ce mot de passe.

| Situation | Outil recommandé |
|:--|:--|
| Saisie interactive | `sudo passwd bob` — le mot de passe n'apparaît nulle part |
| Script, plusieurs comptes | `chpasswd`, qui lit `utilisateur:motdepasse` sur l'entrée standard |
| Hachage déjà calculé | `usermod -p`, avec un hachage généré au préalable |

```bash title="bash"
# Méthode recommandée
$ sudo passwd bob
# Si -p est vraiment nécessaire : générer d'abord le hachage (saisie masquée)
$ HASH=$(openssl passwd -6)
$ sudo usermod -p "$HASH" bob
# Hachage yescrypt (défaut Debian/Ubuntu ; mkpasswd est fourni par le paquet whois)
$ mkpasswd -m yescrypt
```

> [!CAUTION] Sécurité
> Ne tapez jamais un mot de passe en clair sur la ligne de commande : il peut apparaître dans la liste des
> processus pendant l'exécution et rester dans l'historique du shell. En production, préférez un gestionnaire
> de secrets à des mots de passe codés dans des scripts. Debian et Ubuntu hachent par défaut en yescrypt
> (`$y$`), la famille Red Hat en SHA-512 (`$6$`).
