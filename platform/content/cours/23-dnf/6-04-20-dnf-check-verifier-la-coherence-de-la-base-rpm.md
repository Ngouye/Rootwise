| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Détecter dépendances cassées et doublons | Aucun | 🟣 Avancé |

Une mise à jour interrompue, un `rpm --nodeps` malheureux ou un paquet installé hors DNF peuvent rendre la
base RPM incohérente. `dnf check` la contrôle : dépendances manquantes, paquets en double, paquets rendus
obsolètes. **Aucune sortie signifie aucun problème.**

```bash title="bash"
$ dnf check
$ echo $?
0
# Après une mise à jour interrompue, par exemple :
$ dnf check
systemd-252-51.el9.x86_64 is a duplicate with systemd-252-46.el9.x86_64
python3-foo-1.2-3.el9.noarch has missing requires of python3-bar >= 2.0
# Supprimer les anciennes versions en double
$ sudo dnf remove --duplicates
```

## Aller plus loin : vérifier les fichiers avec rpm -V

`dnf check` contrôle la base de paquets ; `rpm -V` contrôle les **fichiers installés** en les comparant aux
informations du paquet. Chaque caractère signale un écart :

![La ligne « S.5....T. c /etc/ssh/sshd_config » de rpm -V : S taille, M mode, 5 empreinte, D périphérique, L lien, U propriétaire, G groupe, T date, P capacités ; ici la taille, l'empreinte et la date diffèrent, et c indique un fichier de configuration ; autres indications : d documentation, g fichier fantôme (ghost), l licence, r lisez-moi, missing fichier absent, ? test impossible (droits)](images/figure-05.webp "Figure 5 — Lecture d'une ligne de rpm -V : un point signifie « conforme ».")

```bash title="bash"
$ rpm -V openssh-server
S.5....T.  c /etc/ssh/sshd_config
# Tous les paquets (plusieurs minutes), sans les fichiers de configuration
$ sudo rpm -Va | grep -v ' c /'
```

> [!IMPORTANT] Comment interpréter
> Un fichier de configuration modifié (`c`) est normal : c'est votre configuration. En revanche, un binaire de
> `/usr/bin` ou `/usr/sbin` dont l'empreinte (`5`) a changé sans mise à jour **doit être examiné de près**.
