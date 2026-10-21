| 🎯 Objectif | 🐧 Systèmes | 🚦 Risque |
|:--|:--|:--|
| Terminer la mise à jour initiale | Debian · Ubuntu · Linux Mint | 🟢 Faible |

La base étant saine, il ne reste qu'à terminer la mise à jour initialement lancée — de préférence dans une
session tmux :

```bash title="bash"
$ sudo apt update
$ sudo apt upgrade
# Facultatif : retirer les dépendances devenues inutiles
$ sudo apt autoremove
```

## Si le problème persiste

| Symptôme | Piste de résolution |
|:--|:--|
| Un paquet échoue à chaque `dpkg --configure -a` | Lire le détail dans `/var/log/dpkg.log` et `/var/log/apt/term.log`, puis corriger la cause (disque plein, script en erreur) |
| `No space left on device` | Libérer de l'espace (`df -h`, `sudo apt clean`), puis relancer `sudo dpkg --configure -a` |
| Archive `.deb` corrompue dans le cache | `sudo apt clean`, puis relancer `sudo apt install -f` |
| Erreur répétée sur un paquet précis | Le réinstaller : `sudo apt install --reinstall <paquet>` |
| `dpkg returned an error code (1)` | Message générique : lire les lignes précédentes, qui nomment le paquet en cause |
