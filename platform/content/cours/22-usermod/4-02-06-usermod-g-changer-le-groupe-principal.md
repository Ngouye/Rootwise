| 🎯 Objectif | 📁 Fichiers modifiés | 🚦 Risque |
|:--|:--|:--|
| Définir le groupe des fichiers créés | `/etc/passwd` (champ 4) + fichiers du home | 🟡 Modéré |

Chaque compte possède un **groupe principal** : les fichiers qu'il crée en héritent. Le groupe cible doit
exister au préalable.

```bash title="bash"
$ sudo groupadd editeurs
$ sudo usermod -g editeurs alice
$ id alice
uid=1001(alice) gid=1002(editeurs) groups=1002(editeurs),27(sudo)
```

Les fichiers du répertoire personnel appartenant à l'ancien groupe principal passent au nouveau groupe.
Ceux situés **ailleurs** ne sont pas modifiés : vérifiez-les, puis corrigez-les délibérément si l'application
l'exige.

```bash title="bash"
$ sudo find /var/lib/monapp -group alice -ls
$ sudo chgrp -R editeurs /var/lib/monapp
```

> [!NOTE] Et l'ancien groupe privé ?
> Le groupe `alice` créé avec le compte reste présent, éventuellement vide. Il est inoffensif ; supprimez-le
> avec `groupdel` seulement après avoir vérifié qu'aucun fichier ni service n'en dépend. Sur un compte de
> service, la vraie question est : « quels fichiers et services dépendent du groupe actuel ? ».
