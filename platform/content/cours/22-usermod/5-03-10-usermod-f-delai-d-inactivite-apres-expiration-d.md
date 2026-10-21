| 🎯 Objectif | 📁 Fichiers modifiés | 🚦 Risque |
|:--|:--|:--|
| Désactiver les comptes non renouvelés | `/etc/shadow` (champ 7) | 🟢 Faible |

L'option `-f` fixe le nombre de jours pendant lesquels l'utilisateur peut encore se connecter — pour changer
son mot de passe — **après l'expiration** de celui-ci. Passé ce délai, le compte est désactivé.

![Frise : le mot de passe changé le 24 août 2026 reste valide 90 jours (chage -M 90) et expire le 22 novembre 2026 ; le délai d'inactivité de 7 jours (usermod -f 7) court jusqu'au 29 novembre 2026, date à laquelle le compte est désactivé ; l'expiration du compte, réglage indépendant, tombe le 31 décembre 2026 (usermod -e 2026-12-31)](images/figure-04.webp "Figure 4 — Expiration du mot de passe, délai d'inactivité et expiration du compte : trois réglages distincts.")

```bash title="bash"
# 1. Le mot de passe doit d'abord avoir une durée de vie (ici 90 jours)
$ sudo chage -M 90 alice
# 2. Puis 7 jours de grâce après son expiration
$ sudo usermod -f 7 alice
$ sudo chage -l alice | grep -i inactive
Password inactive                                  : Nov 29, 2026
# Désactiver le délai d'inactivité
$ sudo usermod -f -1 alice
```

> [!NOTE] « Password inactive : never »
> Le délai d'inactivité n'a de sens que si le mot de passe expire. Si celui-ci n'expire jamais
> (`chage -M 99999`), `chage -l` continue d'afficher « never » malgré le réglage `-f`.
