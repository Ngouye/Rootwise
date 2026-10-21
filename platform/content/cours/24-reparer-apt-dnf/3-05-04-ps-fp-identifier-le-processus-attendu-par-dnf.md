| 🎯 Objectif | 🐧 Systèmes | 🚦 Risque |
|:--|:--|:--|
| Savoir pourquoi dnf patiente | RHEL · Rocky Linux · AlmaLinux · Fedora | ⚪ Aucun |

Sous RHEL, Rocky Linux et AlmaLinux, `dnf` ne produit pas d'erreur de verrou : il patiente et indique le PID
du processus qu'il attend. La commande `ps` permet de savoir de quoi il s'agit :

```bash title="bash"
$ sudo dnf upgrade
Waiting for process with pid 3871 to finish.
# Dans un autre terminal : quel est ce processus ?
$ ps -fp 3871
UID          PID    PPID  C STIME TTY          TIME CMD
root        3871       1  9 10:42 ?        00:00:41 /usr/bin/python3 /usr/bin/dnf makecache
```

| Processus | Action |
|:--|:--|
| `dnf makecache` | Rafraîchissement du cache des métadonnées : patienter quelques minutes |
| `dnf-automatic` | Mises à jour automatiques en cours : les laisser terminer |
| Processus inexistant | La prochaine commande dnf s'exécutera normalement |

```bash title="bash"
# Tâches planifiées liées à dnf (RHEL) et à apt (Debian/Ubuntu)
$ systemctl list-timers 'dnf*'
$ systemctl list-timers 'apt-daily*'
```
