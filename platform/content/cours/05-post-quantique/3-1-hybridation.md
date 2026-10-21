## Pourquoi hybrider ?

Les mécanismes post-quantiques sont jeunes : leur cryptanalyse a quelques années, contre des
décennies pour RSA et les courbes elliptiques. En 2022, deux candidats du processus du NIST sont
tombés : la signature **Rainbow**, cassée en un week-end sur un ordinateur portable, et le KEM
**SIKE**, cassé en une heure environ sur un seul cœur de processeur.

D'où le principe de l'**hybridation**, recommandée par l'ANSSI pendant la transition : combiner un
mécanisme classique éprouvé et un mécanisme post-quantique, de sorte qu'un attaquant doive casser
**les deux**. Si ML-KEM tombait demain, X25519 protégerait encore les échanges contre les attaquants
classiques ; si un ordinateur quantique cassait X25519, ML-KEM tiendrait.

## L'échange de clés hybride dans TLS 1.3

Rien ne change dans la structure de la poignée de main (voir le cours *TLS 1.3*) : un **groupe**
hybride se négocie comme n'importe quel autre.

- Dans le `ClientHello`, le `key_share` du groupe `X25519MLKEM768` transporte la clé
  d'encapsulation ML-KEM-768 (1 184 octets) et une clé publique X25519 (32 octets).
- Le serveur répond dans son `ServerHello` avec le chiffré ML-KEM (1 088 octets) et sa propre clé
  publique X25519.
- Les deux secrets de 32 octets sont combinés et injectés dans le calendrier de clés HKDF habituel.

![Le key_share du ClientHello contient la clé d'encapsulation ML-KEM-768 (1 184 octets) et une clé X25519 (32 octets) ; celui du ServerHello, le chiffré ML-KEM (1 088 octets) et une clé X25519 ; les deux secrets de 32 octets sont concaténés puis passés dans HKDF](images/hybride-tls.png "X25519MLKEM768 : deux échanges de clés en un")

Le prix : un peu plus d'un kilooctet supplémentaire dans chaque sens. Ce groupe est activé par
défaut dans les principaux navigateurs, chez de grands hébergeurs comme Cloudflare, et dans OpenSSL
depuis la version 3.5 (avril 2025).

```bash
openssl s_client -connect cloudflare.com:443 -servername cloudflare.com \
  -groups X25519MLKEM768 </dev/null 2>/dev/null | grep "Negotiated TLS1.3 group"
# Negotiated TLS1.3 group: X25519MLKEM768
```

Côté SSH, OpenSSH 10 (2025) utilise par défaut l'échange hybride `mlkem768x25519-sha256`.

## Ce que dit l'ANSSI (fiche technique ANSSI-FT-115, février 2026)

- La transition de TLS 1.3 ne concerne que la **poignée de main** : le protocole Record, purement
  symétrique, n'est pas menacé.
- La transition pour la **confidentialité** est plus urgente que celle pour l'**authentification**,
  à cause des attaques « stocker maintenant, déchiffrer plus tard » : un échange de clés cassé demain
  expose les enregistrements d'aujourd'hui, alors qu'une signature cassée demain ne permet pas
  d'usurper une session passée.
- L'**hybridation** est la solution privilégiée. Une **clé pré-partagée** peut servir de mesure
  temporaire, mais sa compromission est rétroactive : toutes les sessions qui l'ont utilisée
  deviennent vulnérables.
- La combinaison des deux secrets doit elle-même garantir une sécurité classique **et**
  post-quantique.
- L'**authentification hybride** (certificats et signatures post-quantiques dans TLS 1.3) n'est pas
  encore normalisée. OpenSSL 3.5 implémente ML-DSA et SLH-DSA, mais pas encore leur usage dans
  TLS 1.3.
