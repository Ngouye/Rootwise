Avant toute modification importante, copiez les bases de comptes concernées. En cas de doute après coup,
`pwck` et `grpck` détectent les incohérences dans les bases d'utilisateurs et de groupes.

```bash title="bash"
$ sudo mkdir -p /root/user-backup-$(date +%F)
$ sudo cp -a /etc/passwd /etc/shadow /etc/group /etc/gshadow \
    /root/user-backup-$(date +%F)/
# Contrôler la cohérence des bases (lecture seule avec -r)
$ sudo pwck -r
$ sudo grpck -r
```

> [!WARNING] Ne pas restaurer à l'aveugle
> Ne remplacez jamais `/etc/passwd` ou `/etc/group` par la sauvegarde sur un système en production : d'autres
> comptes ont pu être modifiés depuis. Servez-vous de la copie pour **comparer** (`diff`) et récupérer
> uniquement l'entrée endommagée — idéalement avec `vipw` et `vigr`, qui verrouillent les fichiers pendant
> l'édition.
