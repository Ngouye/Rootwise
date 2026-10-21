![Illustration 3D : un globe translucide parcouru d'arcs lumineux qui relient les points d'un réseau](images/p03-illustration-2.webp "Illustration 3D · le réseau, partout")

L'administrateur système est en première ligne pour configurer, maintenir, dépanner et sécuriser les serveurs
et les réseaux d'une infrastructure. Sous Linux, l'essentiel de ce travail s'effectue **en ligne de commande** :
rapide, scriptable et disponible même sur un serveur sans interface graphique, la console reste l'outil de
référence.

Ce guide présente **22 commandes et utilitaires réseau** incontournables, regroupés en six familles :
configuration et dépannage, analyse et performance, résolution DNS, capture de paquets, surveillance du
trafic et gestion du pare-feu. Pour chacune, vous trouverez une fiche d'identité, une explication de son rôle,
des exemples commentés et les options les plus utiles au quotidien.

## Objectifs du guide

- Disposer d'une référence claire et rapide à consulter au quotidien ;
- Comprendre à quoi sert chaque outil et dans quelle situation l'utiliser ;
- Adopter les commandes modernes (`ip`, `ss`, `nmcli`, nftables) tout en sachant lire les outils historiques ;
- Mettre en œuvre une méthode de diagnostic réseau structurée et reproductible.

## Public visé

Administrateurs systèmes et réseaux, ingénieurs d'exploitation (DevOps, SRE), techniciens support, ainsi que
les étudiants qui préparent une certification Linux (**LPIC-1**, **RHCSA**, **CompTIA Linux+**) ou une formation en
réseaux et télécommunications.

## Conventions utilisées

| Notation | Signification |
|:--|:--|
| `$ commande` | Commande exécutée par un utilisateur standard |
| `$ sudo commande` | Commande nécessitant les privilèges administrateur (root) |
| *enp1s0*, *eth0* | Noms d'interfaces : adaptez-les à votre système (`ip -br link`) |
| `<valeur>` | Paramètre à remplacer par votre propre valeur |
| `# texte` | Commentaire explicatif dans un bloc de code |

> [!NOTE] À propos des exemples
> Les sorties affichées sont des exemples illustratifs : elles varient selon la distribution, la version des
> outils et la configuration du système. Les adresses utilisées (192.168.1.0/24, 198.51.100.0/24,
> 203.0.113.0/24, example.com) sont des valeurs réservées à la documentation.
