![Partie 03](images/p23-bandeau-partie.webp)

Une grande partie des incidents réseau sont en réalité des **problèmes de résolution de noms**. Ces trois
utilitaires interrogent les serveurs DNS pour traduire un nom en adresse IP (et inversement) et inspecter les
différents types d'enregistrements d'une zone.

![Résolution d'un nom de domaine : 1. votre poste (dig example.com) interroge le résolveur DNS 192.168.1.1, qui interroge 2. un serveur racine (zone « . »), 3. le serveur TLD (zone « .com ») et 4. le serveur faisant autorité (zone example.com), puis 5. renvoie la réponse « example.com. 3600 IN A 203.0.113.50 », mise en cache selon son TTL](images/p23-illustration-3.webp "Résolution d'un nom de domaine")

| Fiche | Commande | Rôle |
|:-:|:--|:--|
| 14 | `host` | Résolution DNS simple |
| 15 | `dig` | Interrogation DNS détaillée |
| 16 | `nslookup` | Interrogation DNS directe ou interactive |

## Repères : les enregistrements DNS

| Enregistrement | Contenu |
|:--|:--|
| **A** / **AAAA** | Adresse IPv4 / adresse IPv6 associée à un nom |
| **CNAME** | Alias pointant vers un autre nom |
| **MX** | Serveurs de messagerie du domaine, avec leur priorité |
| **NS** | Serveurs de noms faisant autorité pour la zone |
| **TXT** | Texte libre : SPF, DKIM, vérifications de propriété |
| **PTR** | Résolution inverse : de l'adresse IP vers le nom |
