| 🎯 Objectif | 📁 Fichiers modifiés | 🚦 Risque |
|:--|:--|:--|
| Limiter la durée de vie d'un accès | `/etc/shadow` (champ 8) | 🟢 Faible |

L'option `-e` fixe une **date d'expiration du compte**, au format AAAA-MM-JJ. Passée cette date, le compte
devient inutilisable. Idéal pour les prestataires, stagiaires et accès temporaires : rien à se rappeler, la
fermeture est automatique.

```bash title="bash"
$ sudo usermod -e 2026-12-31 prestataire
$ sudo chage -l prestataire
Last password change                               : Aug 24, 2026
Password expires                                   : never
Password inactive                                  : never
Account expires                                    : Dec 31, 2026
Minimum number of days between password change     : 0
Maximum number of days between password change     : 99999
Number of days of warning before password expires  : 7
# Supprimer la date d'expiration (valeur vide, ou -1 sur les versions récentes)
$ sudo usermod -e "" prestataire
```

> [!NOTE] Compte ou mot de passe ?
> L'expiration du **compte** (`-e`) fixe la durée de validité du compte lui-même. L'expiration du **mot de
> passe** (`chage -M`) fixe la durée de validité du mot de passe actuel. Ce sont deux réglages distincts et
> indépendants.
