| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `bind9-dnsutils` (Debian/Ubuntu) · `bind-utils` (RHEL/Fedora) | Utilisateur | 🟢 Recommandé |

`dig` (*Domain Information Groper*) interroge les serveurs DNS et affiche la réponse de façon détaillée : en-tête,
question, réponse, temps de requête et serveur utilisé. Il permet de consulter tous les types d'enregistrements
(A, CNAME, MX, NS…) et sa précision en fait l'outil privilégié pour **diagnostiquer une zone DNS**.

```bash title="bash"
$ dig example.com
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 23083
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; QUESTION SECTION:
;example.com.                   IN      A

;; ANSWER SECTION:
example.com.            3600    IN      A       203.0.113.50

;; Query time: 4 msec
;; SERVER: 192.168.1.1#53(192.168.1.1) (UDP)
```

Points clés : `status: NOERROR` indique une réponse valide (`NXDOMAIN` : le nom n'existe pas ; `SERVFAIL` : échec
du serveur). Dans la section ANSWER, `3600` est la durée de vie (**TTL**) de l'enregistrement en cache, en
secondes.

| Commande | Usage |
|:--|:--|
| `dig +short example.com` | Afficher uniquement le résultat |
| `dig MX example.com` | Interroger un type d'enregistrement |
| `dig @1.1.1.1 example.com` | Utiliser un serveur DNS précis |
| `dig -x 8.8.8.8` | Résolution inverse |
| `dig +trace example.com` | Suivre la résolution depuis les serveurs racine |
| `dig +noall +answer example.com` | N'afficher que la section réponse |

> [!TIP] Méthode
> Comparer `dig @<dns-interne> nom` et `dig @1.1.1.1 nom` permet de savoir immédiatement si un problème vient
> de votre résolveur interne ou de la zone publique.
