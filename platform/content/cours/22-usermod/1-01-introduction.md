![Illustration 3D d'une salle de serveurs : deux rangées de baies lumineuses se rejoignent vers un point de lumière violette](images/p03-illustration-2.webp "Illustration 3D · salle de serveurs")

La plupart des administrateurs apprennent `usermod -aG` lors de leur première semaine… et ne relisent plus
jamais la documentation. Pourtant, un simple `-a` oublié sur un serveur de production peut retirer à un
développeur **tous ses groupes secondaires** — `sudo`, `docker` et les autres. Aucune confirmation ne
s'affiche, et il n'existe aucune commande d'annulation.

`usermod` modifie un compte utilisateur **existant**. C'est le pendant de `useradd`, qui crée les comptes :
au lieu d'ajouter une entrée, `usermod` change les attributs d'un compte déjà présent — identité, groupes,
répertoire personnel, shell, expiration, mot de passe, identifiants subordonnés pour les conteneurs, et
plus encore.

> [!CAUTION] Le piège n° 1
> `sudo usermod -G docker alice` ne signifie pas « ajouter alice au groupe docker » : cette commande
> **remplace** tous ses groupes secondaires par le seul groupe `docker`. Pour ajouter un groupe en
> conservant les autres, il faut `sudo usermod -aG docker alice`. Retenez : **`-G` remplace, `-aG` ajoute.**

## Objectifs du guide

- Comprendre quels fichiers chaque option de `usermod` modifie réellement ;
- Adopter une méthode sûre : sauvegarder, vérifier avant, modifier, vérifier après ;
- Maîtriser les 16 usages les plus courants : identité, groupes, sécurité du compte, UID et cas avancés ;
- Reconnaître et corriger les messages d'erreur les plus fréquents.

## Public et environnement

Ce guide s'adresse aux administrateurs systèmes, ingénieurs d'exploitation et candidats aux certifications
**RHCSA** ou **LPIC-1**. Les comportements décrits sont ceux des versions récentes de shadow-utils, sur
Ubuntu et Debian ; les différences avec RHEL, Rocky Linux, AlmaLinux et Fedora sont signalées.

## Conventions utilisées

| Notation | Signification |
|:--|:--|
| `$ sudo commande` | Commande nécessitant les privilèges administrateur (root) |
| *alice*, *bob* | Comptes d'exemple : remplacez-les par vos propres noms |
| `# texte` | Commentaire explicatif dans un bloc de code |
| 🟢 Faible · 🟡 Modéré · 🔴 Élevé | Niveau de risque de chaque fiche pour un compte en production |

> [!NOTE] À propos des exemples
> Les sorties sont illustratives : UID, GID, dates et hachages varient d'un système à l'autre. Les noms de
> groupes sont volontairement écrits sans accents ni majuscules, comme l'exigent les règles de nommage par
> défaut.
