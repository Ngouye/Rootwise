| 🎯 Objectif | 📁 Fichiers modifiés | 🚦 Risque |
|:--|:--|:--|
| Bloquer l'authentification par mot de passe | `/etc/shadow` (champs 2 et 8) | 🟡 Modéré |

`-L` verrouille le mot de passe en ajoutant un `!` au début de son hachage dans `/etc/shadow`. Attention :
c'est l'une des options les plus mal comprises, car **verrouiller le mot de passe ne désactive pas le
compte**.

![usermod -L bob ajoute un point d'exclamation devant le hachage dans /etc/shadow : la connexion par mot de passe est bloquée, mais la clé SSH (authorized_keys), su - bob depuis root, les sessions déjà ouvertes et les tâches cron de bob fonctionnent encore ; pour neutraliser réellement le compte : 1. usermod -L -e 1 bob (verrouiller et expirer), 2. pkill -KILL -u bob (terminer les processus), 3. renommer authorized_keys en .disabled (désactiver les clés SSH)](images/figure-05.webp "Figure 5 — Ce que usermod -L bloque… et tout ce qui continue de fonctionner.")

```bash title="bash"
$ sudo usermod -L bob
$ sudo getent shadow bob | cut -d: -f2
!$y$j9T$rH2kQ...
# Neutraliser complètement un compte
$ sudo usermod -L -e 1 bob               # verrouiller + expirer le compte
$ sudo pkill -KILL -u bob                # terminer ses processus
$ sudo mv /home/bob/.ssh/authorized_keys /home/bob/.ssh/authorized_keys.disabled
# Déverrouiller et annuler l'expiration
$ sudo usermod -U -e "" bob
$ sudo passwd -S bob
bob P 2026-08-24 0 99999 7 -1
```

> [!NOTE] Compte sans mot de passe
> Si le compte n'a jamais eu de mot de passe, `usermod -U` refuse de créer un compte accessible sans mot de
> passe. Définissez-en un avec `passwd`.
