![Illustration 3D d'un poste d'administration : trois écrans affichent des terminaux Bash et un tableau de bord de supervision](images/p03-illustration-2.webp "Illustration 3D · poste d'administration")

La plupart des utilisateurs de Linux ne croisent le point d'exclamation que dans deux situations : le
célèbre `sudo !!`, ou un mot de passe contenant un `!` qui déclenche l'erreur « event not found ».
Ce simple caractère cache pourtant deux mécanismes puissants que beaucoup ignorent pendant des années.

La raison est que `!` joue **deux rôles totalement différents** dans Bash. Dans un terminal interactif, il
déclenche l'**expansion de l'historique** : rappeler, réutiliser et corriger les commandes déjà tapées.
Dans les tests, les commandes, les motifs de fichiers et l'expansion des paramètres, il exprime la
**négation** — et fonctionne alors aussi bien en interactif que dans les scripts.

> [!IMPORTANT] Commandes rétablies et erreurs corrigées
> La traduction automatique de l'article d'origine a francisé du code : « histoire » pour `history`,
> « boutique -s extglob » pour `shopt -s extglob`, « ensemble +H » pour `set +H`, « si … alors … fi » pour
> `if … then … fi`, « déclarer -A » pour `declare -A`… Ce guide rétablit tout. Il corrige aussi plusieurs
> erreurs : `!:3*` désigne les arguments **à partir du troisième** (et non « 2 à 4 »), `:e` renvoie
> l'extension **avec son point**, l'option de prévisualisation s'appelle `histverify`, et l'exemple
> `chown … !*` reprenait par erreur l'option `-p`.

## Objectifs du guide

- Rappeler n'importe quelle commande de l'historique sans la retaper ;
- Réutiliser et transformer les arguments des commandes précédentes ;
- Éviter les pièges : prévisualiser avant d'exécuter, corriger l'erreur « event not found » ;
- Maîtriser la négation dans les scripts : tests, codes de retour, motifs d'exclusion, expansion indirecte.

## Public et environnement

Ce guide s'adresse aux administrateurs, développeurs et utilisateurs avancés du terminal. Tous les
exemples ont été vérifiés avec **Bash 5.2**. zsh et ksh proposent une expansion d'historique proche ;
dash et le `sh` POSIX ne la proposent pas du tout — une différence décisive dès que l'on écrit des scripts.

## Conventions utilisées

| Notation | Signification |
|:--|:--|
| `$ commande` | Commande tapée dans un terminal Bash interactif |
| Ligne qui suit un `!` | La commande développée, que Bash affiche avant de l'exécuter |
| `# texte` | Commentaire explicatif dans un bloc de code |
| **Interactif** · **Partout** | Fonctionne seulement dans un terminal, ou aussi dans les scripts |
| 🟢 Essentiel · 🔵 Pratique · 🟣 Avancé | Niveau de chaque fiche |

> [!NOTE] À propos des exemples
> Les numéros d'historique (1549, 1551…) et les chemins varient d'un système à l'autre : utilisez
> `history` pour trouver les vôtres. Les messages de Bash sont reproduits en anglais, tels qu'ils s'affichent.
