![Illustration 3D d'une salle de serveurs : deux rangées de baies lumineuses bleues se rejoignent vers un point de lumière](images/p03-illustration-2.webp "Illustration 3D · salle de serveurs")

Une mise à jour lancée à distance, une connexion SSH qui se coupe dix secondes… et, à la reconnexion, plus
rien ne s'installe. Ce scénario, que tout administrateur rencontre un jour, laisse le gestionnaire de paquets
**verrouillé** et plusieurs paquets dans un **état intermédiaire**.

Sous Debian et Ubuntu, la tentative suivante se heurte généralement à des messages de ce type :

```bash title="debian / ubuntu"
$ sudo apt upgrade
E: Could not get lock /var/lib/dpkg/lock-frontend.
   It is held by process 2143 (unattended-upgr)
E: dpkg was interrupted, you must manually run
   'sudo dpkg --configure -a' to correct the problem.
```

Sur la famille Red Hat (RHEL, Rocky Linux, AlmaLinux, Fedora), le symptôme est différent : `dnf` se met en
attente d'un autre processus, ou `dnf check` signale qu'un même paquet est installé en deux versions.

```bash title="rhel / rocky / almalinux"
$ sudo dnf upgrade
Waiting for process with pid 3871 to finish.
$ sudo dnf check
openssl-libs-1:3.2.2-6.el10.x86_64 is a duplicate with
    openssl-libs-1:3.2.2-4.el10.x86_64
```

> [!CAUTION] Le mauvais réflexe
> Supprimer les fichiers de verrou et forcer l'installation transforme souvent un incident bénin en panne
> sérieuse : deux programmes peuvent alors écrire en même temps dans la base des paquets et la corrompre.

Bonne nouvelle : apt et dnf tiennent un **registre précis** de chaque opération. Dans la grande majorité des
cas, ils savent terminer eux-mêmes le travail interrompu, sans réinstaller le serveur — à condition d'exécuter
les bonnes commandes, dans le bon ordre. C'est l'objet de ce cours.

## Objectifs du guide

- Comprendre pourquoi le gestionnaire de paquets se verrouille et ce qu'une interruption laisse derrière elle ;
- Identifier sans risque le processus qui bloque, avant toute action ;
- Réparer pas à pas une mise à jour interrompue sous Debian/Ubuntu (`dpkg`, `apt`) et sous
  RHEL/Rocky/AlmaLinux (`dnf`, `rpm`) ;
- Prévenir les incidents grâce à tmux, aux instantanés et à l'historique des transactions.

## Public visé

Administrateurs systèmes, ingénieurs d'exploitation et techniciens qui gèrent des serveurs Linux, ainsi que
les candidats aux certifications **RHCSA**, **LPIC-1** ou **CompTIA Linux+**.

## Conventions utilisées

| Notation | Signification |
|:--|:--|
| `$ commande` | Commande exécutée par un utilisateur standard |
| `$ sudo commande` | Commande nécessitant les privilèges administrateur (root) |
| `<PID>`, `<paquet>` | Valeur à remplacer par celle de votre système |
| `# texte` | Commentaire explicatif dans un bloc de code |
| ⚪ Aucun … 🔴 Élevé | Niveau de risque de chaque commande (voir la synthèse) |

> [!NOTE] À propos des exemples
> Les sorties présentées sont illustratives : numéros de processus (PID), versions de paquets et formulation
> exacte des messages varient selon la distribution et la version du gestionnaire de paquets.
