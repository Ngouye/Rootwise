![Partie 02](images/p15-bandeau-partie.webp)

Un disque lent ralentit tout le système, même quand le processeur semble au repos. Ces trois outils répondent à
trois questions : **quel périphérique souffre**, **quel processus l'occupe**, et **quels fichiers sont ouverts**.

![De l'application au disque, qui voit quoi ? 1. les processus, qui lit et qui écrit (iotop) ; 2. les fichiers ouverts et les montages (lsof) ; 3. la couche bloc, file d'attente et latence (iostat -x) ; 4. le périphérique NVMe, SSD, HDD ou NFS (iostat, sar -d)](images/p15-illustration-3.webp "De l'application au disque : qui voit quoi ?")

| Fiche | Outil | Rôle |
|:-:|:--|:--|
| 06 | `iostat` | Débit, latence et saturation des disques |
| 07 | `iotop` | Les E/S disque par processus |
| 08 | `lsof` | Les fichiers et sockets ouverts |
