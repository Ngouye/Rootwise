`dpkg` mémorise l'état de chaque paquet dans `/var/lib/dpkg/status`. L'installation se déroule en deux temps :
la **décompression** (copie des fichiers sur le disque), puis la **configuration** (exécution des scripts
d'installation). Une interruption entre les deux laisse des paquets dans un état intermédiaire : c'est
exactement ce que signifie le message « dpkg was interrupted ».

![Cycle de vie d'un paquet dans dpkg : not-installed (paquet non installé), décompression vers iU unpacked (fichiers copiés), configuration vers iF half-configured (scripts en cours), puis ii installed (état normal) ; une interruption pendant la configuration laisse les paquets en iU ou iF, et sudo dpkg --configure -a les amène à ii](images/figure-03.webp "Figure 3 — Cycle de vie d'un paquet dans dpkg et point de rupture typique d'une mise à jour interrompue.")

| Code (`dpkg -l`) | État | Signification |
|:-:|:--|:--|
| `ii` | installed | Paquet installé et configuré : état normal |
| `iU` | unpacked | Fichiers copiés sur le disque, configuration non effectuée |
| `iF` | half-configured | Configuration commencée mais non terminée |
| `iH` | half-installed | Installation interrompue en cours de décompression |

```bash title="bash"
# Lister les paquets qui ne sont pas dans un état normal
$ dpkg -l | grep -E '^i[UFH]'
iU  libssl3t64:amd64  3.0.13-0ubuntu3.5  amd64  Secure Sockets Layer toolkit
iF  openssl           3.0.13-0ubuntu3.5  amd64  Secure Sockets Layer toolkit
```
