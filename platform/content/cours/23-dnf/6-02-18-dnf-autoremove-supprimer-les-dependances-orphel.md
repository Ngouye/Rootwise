| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Récupérer de l'espace, réduire la surface d'attaque | root (`sudo`) | 🔵 Pratique |

Lorsqu'un paquet est supprimé, ses dépendances peuvent rester sur le disque sans plus servir à rien.
`dnf autoremove` supprime tous les paquets installés **comme dépendance** dont plus aucun paquet n'a besoin.

```bash title="bash"
# Prévisualiser ce qui serait supprimé
$ dnf repoquery --unneeded
$ sudo dnf autoremove
Removing:
 gd             x86_64      2.3.2-3.el9         @appstream        406 k
 libXpm         x86_64      3.5.13-10.el9       @appstream        114 k
 libwebp        x86_64      1.2.0-8.el9         @appstream        788 k

Transaction Summary
================================================================================
Remove  3 Packages

Freed space: 1.3 M
Is this ok [y/N]:
```

## Protéger un paquet indispensable

Un paquet installé comme dépendance, mais que vous utilisez directement, risque d'être emporté. Marquez-le
comme **installé par l'utilisateur** :

```bash title="bash"
$ sudo dnf mark install gd        # DNF 4
$ sudo dnf mark user gd           # DNF5
```

## Faire le ménage dans les anciens noyaux

DNF conserve plusieurs noyaux (`installonly_limit=3` par défaut) pour permettre un retour en arrière au
démarrage. Pour n'en garder que deux :

```bash title="bash"
$ sudo dnf remove --oldinstallonly --setopt installonly_limit=2 kernel
```
