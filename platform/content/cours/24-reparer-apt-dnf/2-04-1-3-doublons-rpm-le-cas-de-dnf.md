Sur la famille Red Hat, `dnf` s'appuie sur **RPM**. Lors d'une mise à jour, RPM installe d'abord la nouvelle
version d'un paquet, **puis** supprime l'ancienne. Si l'opération s'arrête entre ces deux étapes, la base RPM
enregistre les deux versions à la fois : `dnf` refuse alors de modifier ces paquets tant que le doublon n'a pas
été éliminé.

```bash title="bash"
$ rpm -q openssl-libs
openssl-libs-3.2.2-4.el10.x86_64
openssl-libs-3.2.2-6.el10.x86_64
```

Autre différence notable : `dnf` ne renvoie pas d'erreur de verrou lorsqu'une autre instance travaille. Il
**patiente** et affiche « Waiting for process with pid … to finish ».

> [!WARNING] Pourquoi ne pas supprimer les verrous d'emblée
> Supprimer un fichier de verrou pendant qu'un processus l'utilise permet à un second programme d'écrire dans
> la base en même temps que le premier. Résultat le plus fréquent : une base dpkg ou RPM incohérente, bien plus
> difficile à réparer que l'incident de départ.
