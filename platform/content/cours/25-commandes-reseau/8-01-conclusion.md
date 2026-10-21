![Illustration 3D d'une salle de serveurs : deux rangées de baies lumineuses vertes se rejoignent vers un point de lumière](images/p36-illustration-2.webp "Illustration 3D · salle de serveurs")

Ce cours a passé en revue les **22 outils** en ligne de commande les plus utilisés pour la gestion du réseau
sous Linux, classés par familles. Ils constituent le socle de compétences de tout administrateur système, et sont
tout aussi utiles aux administrateurs et ingénieurs réseau à temps plein.

La maîtrise de ces commandes repose sur trois principes : **privilégier les outils modernes** (`ip`, `ss`, `nmcli`,
nftables) tout en sachant lire les outils historiques encore présents sur de nombreux serveurs ; **procéder avec
méthode**, de la couche physique jusqu'à l'application ; et **agir avec prudence**, en particulier sur les pare-feu
et les serveurs distants.

## En résumé : la démarche de diagnostic

![Les sept étapes d'un diagnostic méthodique : 1. lien (ethtool), 2. adressage (ip, nmcli), 3. connectivité (ping, mtr), 4. DNS (dig), 5. services (ss, nc, nmap), 6. pare-feu (ufw, nft), 7. analyse fine (tcpdump, Wireshark)](images/figure-04.webp "Figure 4 — Les sept étapes d'un diagnostic réseau méthodique et les outils associés.")

## Pour aller plus loin

- `man <commande>` : la documentation complète et officielle de chaque outil ;
- `<commande> --help` : un résumé rapide des options disponibles ;
- `tldr <commande>` : des exemples pratiques et concis (paquet `tldr`) ;
- Un laboratoire virtuel (VirtualBox, KVM, GNS3) pour s'exercer sans risque.
