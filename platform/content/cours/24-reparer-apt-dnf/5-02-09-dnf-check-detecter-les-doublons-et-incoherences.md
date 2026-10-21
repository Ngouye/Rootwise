| 🎯 Objectif | 🐧 Systèmes | 🚦 Risque |
|:--|:--|:--|
| Contrôler la base locale des paquets | RHEL · Rocky Linux · AlmaLinux · Fedora | ⚪ Aucun |

`dnf check` contrôle la base locale des paquets : dépendances manquantes, doublons, paquets rendus obsolètes.
Après une mise à jour interrompue, il révèle les paquets enregistrés en deux versions :

```bash title="bash"
$ sudo dnf check
openssl-libs-1:3.2.2-6.el10.x86_64 is a duplicate with openssl-libs-1:3.2.2-4.el10.x86_64
glibc-2.39-37.el10.x86_64 is a duplicate with glibc-2.39-17.el10.x86_64
```

Chaque ligne désigne un paquet présent en deux versions : la nouvelle a été installée, l'ancienne n'a pas
encore été retirée. Les numéros de version varient selon votre système.

> [!TIP] Astuce
> `sudo dnf check --duplicates` limite le contrôle aux seuls doublons. Les noyaux (`kernel`) coexistent
> normalement en plusieurs versions : ils ne sont pas signalés.
