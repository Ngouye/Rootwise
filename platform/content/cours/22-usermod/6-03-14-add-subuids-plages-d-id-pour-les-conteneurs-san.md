| 🎯 Objectif | 📁 Fichiers modifiés | 🚦 Risque |
|:--|:--|:--|
| Préparer Podman ou Docker rootless | `/etc/subuid`, `/etc/subgid` | 🟡 Modéré |

Podman et Docker sans root font correspondre les UID et GID internes d'un conteneur à une **plage
d'identifiants subordonnés** réservée à l'utilisateur sur l'hôte. Une plage de 65 536 identifiants est l'usage
courant.

```bash title="bash"
$ sudo usermod --add-subuids 200000-265535 --add-subgids 200000-265535 alice
$ grep alice /etc/subuid /etc/subgid
/etc/subuid:alice:200000:65536
/etc/subgid:alice:200000:65536
# Appliquer la nouvelle correspondance aux conteneurs existants (en tant qu'alice)
$ podman system migrate
# Retirer les plages
$ sudo usermod --del-subuids 200000-265535 --del-subgids 200000-265535 alice
```

| Option | Effet |
|:--|:--|
| `-v`, `--add-subuids` | Ajouter une plage d'UID subordonnés |
| `-V`, `--del-subuids` | Retirer une plage d'UID subordonnés |
| `-w`, `--add-subgids` | Ajouter une plage de GID subordonnés |
| `-W`, `--del-subgids` | Retirer une plage de GID subordonnés |

> [!WARNING] Pas de chevauchement
> Les plages de deux utilisateurs ne doivent **jamais se chevaucher**. Sur un serveur partagé, tenez un
> registre des plages attribuées.
