| 🎯 Objectif | 📁 Fichiers modifiés | 🚦 Risque |
|:--|:--|:--|
| Aligner un UID entre plusieurs serveurs | `/etc/passwd` (champ 3) + fichiers du home | 🔴 Élevé |

Changer un UID est l'une des opérations les plus sensibles : sous Linux, la propriété des fichiers est
enregistrée sous forme d'**UID numérique**, pas de nom. L'UID 0 est root ; les UID 1 à 999 sont réservés aux
comptes système (`SYS_UID_MIN`/`SYS_UID_MAX` dans `/etc/login.defs`) ; les comptes ordinaires commencent à
`UID_MIN`, généralement 1000.

![Avant, bob a l'UID 1002 et possède /home/bob/notes.txt, /home/bob/.ssh/config et /srv/data/rapport.csv ; après usermod -u 1500, les deux fichiers du répertoire personnel passent à l'UID 1500, mais /srv/data/rapport.csv garde l'ancien UID 1002 ; correction ciblée : sudo find / -xdev -uid 1002 -exec chown -h bob {} +](images/figure-06.webp "Figure 6 — Après usermod -u, les fichiers hors du répertoire personnel gardent l'ancien UID.")

```bash title="bash"
$ id bob
uid=1002(bob) gid=1003(bob) groups=1003(bob)
# L'UID 1500 est-il libre ? (aucune sortie = libre)
$ getent passwd 1500
$ sudo usermod -u 1500 bob
# Retrouver et corriger les fichiers qui portent encore l'ancien UID
$ sudo find / -xdev -uid 1002 -ls
$ sudo find / -xdev -uid 1002 -exec chown -h bob {} +
```

> [!CAUTION] Prudence
> Examinez les fichiers trouvés avant de les réattribuer : un UID peut être partagé volontairement avec un
> autre service. Répétez la recherche pour chaque système de fichiers monté (`-xdev` limite la recherche au
> système courant). Et réservez `-o` (UID en double) aux migrations : deux comptes avec le même UID
> partagent **tous** leurs fichiers.
