![Illustration 3D d'une salle de serveurs : deux rangées de baies lumineuses vertes se rejoignent vers un point de lumière](images/p03-illustration-2.webp "Illustration 3D · salle de serveurs")

Sur Fedora, Red Hat Enterprise Linux, Rocky Linux, AlmaLinux ou CentOS Stream, presque toute la vie d'un
serveur passe par une seule commande : `dnf`. Installer un service, appliquer les correctifs de sécurité,
revenir en arrière après une mise à jour problématique, activer un dépôt ou libérer de l'espace disque :
tout commence par elle.

**DNF** (*Dandified YUM*) a succédé à YUM comme gestionnaire de paquets de la famille Red Hat. Il s'appuie
sur **RPM** pour installer les fichiers, mais ajoute ce que RPM ne fait pas seul : la recherche dans les
dépôts, la résolution automatique des dépendances, la vérification des signatures et un historique des
transactions qui permet d'annuler une opération.

> [!IMPORTANT] Des commandes qui ne se traduisent pas
> La traduction automatique de l'article d'origine a francisé les commandes : « dnf installer », « dnf
> supprimer », « liste de groupes dnf », « vérification sudo dnf »… Aucune de ces formes ne fonctionne. Les
> commandes DNF s'écrivent **toujours en anglais** : ce guide les rétablit toutes, telles que vous devez les
> taper (`dnf install`, `dnf remove`, `dnf group list`, `sudo dnf check`…).

## Objectifs du guide

- Maîtriser les 20 commandes DNF du quotidien, de l'installation à la vérification de la base RPM ;
- Savoir annuler une transaction, revenir à une version antérieure ou réparer un paquet endommagé ;
- Gérer dépôts, groupes et modules sans fragiliser le système ;
- Anticiper la transition vers DNF5, le gestionnaire par défaut de Fedora depuis la version 41.

## Public et environnement

Ce guide s'adresse aux administrateurs systèmes, ingénieurs DevOps et candidats aux certifications **RHCSA**
ou **RHCE**. Les exemples sont rédigés pour **DNF 4**, utilisé par RHEL 8, 9 et 10, Rocky Linux, AlmaLinux et
CentOS Stream. Les différences avec **DNF5** (Fedora 41 et suivantes) sont signalées au fil des fiches et
détaillées dans un chapitre dédié.

## Conventions utilisées

| Notation | Signification |
|:--|:--|
| `$ sudo commande` | Commande qui modifie le système : privilèges administrateur (root) requis |
| `$ commande` | Commande de consultation, utilisable sans privilège |
| *nginx*, *curl* | Paquets d'exemple : remplacez-les par les vôtres |
| `# texte` | Commentaire explicatif dans un bloc de code |
| 🟢 Essentiel · 🔵 Pratique · 🟣 Avancé | Niveau de chaque fiche : usage quotidien, régulier ou ponctuel |

> [!NOTE] À propos des exemples
> Les sorties sont illustratives : versions, tailles, numéros de transaction et noms de dépôts varient selon
> la distribution et la date. Elles sont reproduites en anglais, telles que DNF les affiche. La plupart ont
> été prises sur Rocky Linux 9.
