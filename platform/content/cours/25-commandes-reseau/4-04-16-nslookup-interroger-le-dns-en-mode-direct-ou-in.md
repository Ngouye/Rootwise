| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `bind9-dnsutils` (Debian/Ubuntu) · `bind-utils` (RHEL/Fedora) | Utilisateur | 🔵 Actif |

`nslookup` est un utilitaire très répandu — il existe aussi sous Windows — qui interroge les serveurs DNS soit
**directement** (une requête en ligne de commande), soit en **mode interactif** (une invite dans laquelle on
enchaîne les requêtes). Il permet notamment de trouver l'enregistrement A (adresse IP) d'un domaine ou
d'effectuer une résolution inverse.

```bash title="bash"
$ nslookup example.com
Server:         192.168.1.1
Address:        192.168.1.1#53

Non-authoritative answer:
Name:   example.com
Address: 203.0.113.50
```

« Non-authoritative answer » signifie que la réponse provient du **cache d'un résolveur**, et non directement du
serveur faisant autorité pour la zone.

```bash title="bash"
# Résolution inverse
$ nslookup 8.8.8.8
# Type d'enregistrement et serveur DNS précis
$ nslookup -type=MX example.com 1.1.1.1
# Mode interactif
$ nslookup
> set type=NS
> example.com
> exit
```

## host, dig ou nslookup : lequel choisir ?

| Besoin | Outil conseillé |
|:--|:--|
| Vérification rapide d'un nom ou d'une adresse | `host` |
| Diagnostic détaillé, scripts (`+short`), suivi de résolution | `dig` |
| Habitudes Windows, enchaînement de requêtes interactives | `nslookup` |
