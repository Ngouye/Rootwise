![Partie 01](images/p08-bandeau-partie.webp)

Installer un service, le retirer proprement, vérifier puis appliquer les mises à jour : ce sont les gestes que
vous répéterez le plus souvent. À chaque fois, DNF **calcule une transaction complète** et vous la présente
avant d'agir.

![Une transaction DNF en cinq étapes : 1. résoudre les dépendances, 2. télécharger les paquets RPM, 3. vérifier les signatures GPG, 4. installer (transaction RPM), 5. journaliser (dnf history) ; une seule commande, sudo dnf install nginx, pour une transaction complète : Install 4 Packages, 635 k](images/p08-illustration-3.webp "Une transaction DNF en cinq étapes")

| Fiche | Commande | Rôle |
|:-:|:--|:--|
| 01 | `dnf install` | Installer un paquet et ses dépendances |
| 02 | `dnf remove` | Désinstaller un paquet proprement |
| 03 | `dnf check-update` | Vérifier les mises à jour disponibles |
| 04 | `dnf upgrade` | Mettre à jour un paquet ou tout le système |
| 05 | `dnf install ./x.rpm` | Installer un RPM local ou distant |
