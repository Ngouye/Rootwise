| 🎯 Objectif | 🔑 Privilèges | 📶 Niveau |
|:--|:--|:--|
| Appliquer correctifs et nouvelles versions | root (`sudo`) | 🟢 Essentiel |

`dnf upgrade` met à jour tous les paquets du système, ou seulement ceux que vous indiquez. `dnf update` en est
un alias historique : les deux commandes sont équivalentes, mais **`upgrade` est la forme recommandée**.

```bash title="bash"
# Tout le système, en forçant le rafraîchissement des métadonnées
$ sudo dnf upgrade --refresh
# Un seul paquet
$ sudo dnf upgrade openssl
# Uniquement les correctifs de sécurité (RHEL, Rocky Linux, AlmaLinux)
$ sudo dnf upgrade --security
# Tout mettre à jour, sauf le noyau
$ sudo dnf upgrade --exclude='kernel*'
```

## Faut-il redémarrer ?

Un noyau, la glibc ou systemd mis à jour ne sont pris en compte qu'après un redémarrage. La commande
`needs-restarting`, fournie par `dnf-plugins-core`, répond à la question :

```bash title="bash"
$ sudo dnf needs-restarting -r
Core libraries or services have been updated since boot-up:
  * kernel
  * systemd

Reboot is required to fully utilize these updates.
More information: https://access.redhat.com/solutions/27943
```

> [!NOTE] Code de retour
> `needs-restarting -r` renvoie **1** lorsqu'un redémarrage est nécessaire et **0** sinon : idéal dans un
> playbook. Sans `-r`, la commande liste les processus qui utilisent encore d'anciennes bibliothèques et qu'il
> suffit de relancer.
