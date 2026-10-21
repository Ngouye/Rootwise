| 🎯 Objectif | 🐧 Systèmes | 🚦 Risque |
|:--|:--|:--|
| Pouvoir revenir en arrière en quelques minutes | Serveurs de production | ⚪ Aucun |

Avant toute mise à jour majeure d'un serveur de production, créez un **instantané** ou vérifiez la fraîcheur de
vos sauvegardes. En cas d'échec, revenir à l'instantané prend quelques minutes — contre parfois des heures de
réparation.

| Environnement | Solution d'instantané |
|:--|:--|
| Machine virtuelle (KVM, VMware, Proxmox, cloud) | Instantané de la VM depuis l'hyperviseur ou la console du fournisseur |
| Volumes LVM | Instantané de volume logique : `lvcreate --snapshot` |
| Système de fichiers Btrfs | Snapper ou `btrfs subvolume snapshot` |
| Poste de travail | Timeshift |
