| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `bind9-dnsutils` (Debian/Ubuntu) · `bind-utils` (RHEL/Fedora) | Utilisateur | 🔵 Actif |

`host` est l'utilitaire de recherche DNS le plus simple : il traduit un nom d'hôte en adresses IP et une adresse
IP en nom d'hôte, avec une sortie concise et lisible. Idéal pour une **vérification rapide**.

```bash title="bash"
$ host example.com
example.com has address 203.0.113.50
example.com has IPv6 address 2001:db8::50
example.com mail is handled by 10 mail.example.com.
# Un type d'enregistrement précis
$ host -t MX example.com
# Résolution inverse (adresse IP vers nom)
$ host 8.8.8.8
8.8.8.8.in-addr.arpa domain name pointer dns.google.
# Interroger un serveur DNS particulier
$ host example.com 1.1.1.1
```

| Option | Effet |
|:--|:--|
| `-t <type>` | Type d'enregistrement à interroger (A, AAAA, MX, NS, TXT…) |
| `-a` | Toutes les informations disponibles (équivalent de ANY) |
| `-4` / `-6` | Utiliser IPv4 ou IPv6 pour joindre le serveur DNS |
| `-W <s>` | Délai d'attente maximal de la réponse |
