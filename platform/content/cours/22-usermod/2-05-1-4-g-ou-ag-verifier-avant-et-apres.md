L'option qui mérite toute votre attention est `-G`. Employée seule, elle **remplace** la liste complète des
groupes secondaires. Associée à `-a`, elle **ajoute** les groupes indiqués en conservant les autres.

![alice appartient aux groupes secondaires sudo, editeurs et adm ; usermod -G docker alice remplace la liste : alice perd sudo, editeurs et adm sans aucun avertissement et ne garde que docker ; usermod -aG docker alice ajoute docker et conserve les groupes existants](images/figure-02.webp "Figure 2 — -G remplace la liste des groupes secondaires ; -aG l'enrichit.")

```bash title="bash"
# Avant : noter les groupes actuels
$ id alice
uid=1001(alice) gid=1001(alice) groups=1001(alice),27(sudo),1002(editeurs)
$ sudo usermod -aG docker alice
# Après : vérifier que rien n'a disparu
$ id -nG alice
alice sudo editeurs docker
```

> [!TIP] Le bon réflexe
> Notez la sortie de `id` **avant** toute modification de groupes : c'est la seule trace qui permettra de
> reconstituer la liste si un `-G` a été tapé par erreur.
