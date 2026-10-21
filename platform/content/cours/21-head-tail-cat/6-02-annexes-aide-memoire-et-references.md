Ces annexes rassemblent les options à garder sous la main, l'emplacement des journaux selon la
distribution, les pièges les plus fréquents et un glossaire.

## A. Aide-mémoire head

| Option | Effet |
|:--|:--|
| `head -n N` (ou `-N`) | Les N premières lignes (10 par défaut) |
| `head -n -N` | Tout sauf les N dernières lignes (GNU) |
| `head -c N` | Les N premiers octets (suffixes K, M, G acceptés) |
| `head -c -N` | Tout sauf les N derniers octets (GNU) |
| `head -q` / `-v` | Masquer / toujours afficher les en-têtes de fichiers |

## B. Aide-mémoire tail

| Option | Effet |
|:--|:--|
| `tail -n N` (ou `-N`) | Les N dernières lignes (10 par défaut) |
| `tail -n +N` | Depuis la ligne N jusqu'à la fin |
| `tail -c N` | Les N derniers octets |
| `tail -f` | Suivre le fichier ouvert (descripteur) |
| `tail -F` | Suivre par nom et réessayer (= `--follow=name --retry`) |
| `tail --pid=PID` | Arrêter le suivi à la fin du processus PID |
| `tail -s N` | Intervalle de vérification, en secondes |

## C. Aide-mémoire cat et tac

| Option | Effet |
|:--|:--|
| `cat f1 f2` | Afficher les fichiers à la suite |
| `cat f1 f2 > f3` | Concaténer dans un nouveau fichier (remplace f3) |
| `cat f1 >> f2` | Ajouter f1 à la fin de f2 |
| `cat -n` / `-b` | Numéroter toutes les lignes / les lignes non vides |
| `cat -s` | Fusionner les lignes vides consécutives |
| `cat -A` | Révéler tabulations, fins de ligne, caractères spéciaux |
| `cat -E` / `-T` | Afficher les fins de ligne (`$`) / les tabulations (`^I`) |
| `tac fichier` | Afficher les lignes en ordre inverse |

## D. Où trouver les journaux ?

| Contenu | Debian / Ubuntu | RHEL / Rocky / Alma |
|:--|:--|:--|
| Journal système général | `/var/log/syslog` | `/var/log/messages` |
| Authentification (SSH, sudo) | `/var/log/auth.log` | `/var/log/secure` |
| Noyau | `/var/log/kern.log` | `journalctl -k` |
| Tâches cron | `/var/log/syslog` | `/var/log/cron` |
| Gestionnaire de paquets | `/var/log/apt/history.log` | `/var/log/dnf.log` |
| Serveur web nginx | `/var/log/nginx/` | `/var/log/nginx/` |
| Services systemd | `journalctl -u <service>` | `journalctl -u <service>` |

> [!NOTE] Debian 12 et conteneurs
> Depuis Debian 12, rsyslog n'est plus installé par défaut : `/var/log/syslog` peut donc être absent. Les
> journaux restent consultables avec `journalctl`.

## E. Pièges courants

| Symptôme | Cause | Solution |
|:--|:--|:--|
| `tail -f` muet depuis la nuit | Le journal a été tourné par logrotate | Utiliser `tail -F` |
| `cat a b > a` a vidé `a` | Le shell tronque la destination avant la lecture | Écrire dans un fichier temporaire |
| `sudo cat >> fichier` refusé | La redirection est faite sans privilèges | `sudo tee -a fichier` |
| `bad interpreter: /bin/bash^M` | Fins de ligne Windows (CRLF) | `cat -A`, puis `sed -i 's/\r$//'` ou `dos2unix` |
| Terminal illisible après un `cat` | Un fichier binaire a été affiché | Taper `reset` |
| `head -n -5` refusé | Version BSD/macOS de `head` | GNU coreutils (`ghead`) |
| `/var/log/syslog` introuvable | rsyslog absent (Debian 12, conteneurs) | `journalctl` |

## F. Sources et références

- Anusha Saive, « Afficher et gérer des fichiers à l'aide des commandes head, tail et cat sous Linux »,
  *Tecmint* (tecmint.com), mis à jour le 27 août 2026. Article dont ce guide reprend le plan et qu'il
  enrichit.
- Pages de manuel Linux : `head(1)`, `tail(1)`, `cat(1)`, `tac(1)`, `journalctl(1)`, `sed(1)`, `less(1)`.
- GNU Coreutils — manuel officiel (gnu.org/software/coreutils/manual).

## G. Glossaire

| Terme | Définition |
|:--|:--|
| **Sortie standard** (stdout) | Flux où une commande écrit son résultat ; par défaut, le terminal |
| **Entrée standard** (stdin) | Flux d'où une commande lit ses données ; par défaut, le clavier |
| **Redirection** | `>` envoie la sortie dans un fichier (en le remplaçant), `>>` l'ajoute à la fin |
| **Tube** (pipe) | `\|` relie la sortie d'une commande à l'entrée de la suivante |
| **Descripteur de fichier** | Référence interne qu'un processus garde vers un fichier ouvert |
| **Rotation des journaux** | Archivage périodique d'un journal (renommage, compression) par logrotate |
| **Heredoc** | Bloc de texte fourni à une commande directement dans la ligne de commande (`<< EOF`) |
| **EOF** · Ctrl+D | Fin de fichier : signale à une commande que la saisie est terminée |
| **LF** · **CRLF** | Fin de ligne Unix (`\n`) et Windows (`\r\n`) ; le `\r` s'affiche `^M` |
| **Octet** | Unité de 8 bits ; un caractère accentué en occupe plusieurs en UTF-8 |
| **GNU coreutils** | Ensemble des utilitaires de base de Linux, dont `head`, `tail`, `cat` et `tac` |
| **journald** | Service de journalisation de systemd, consulté avec `journalctl` |
