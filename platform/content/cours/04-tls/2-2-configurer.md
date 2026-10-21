Le guide de l'ANSSI *Recommandations de sécurité relatives à TLS* (fourni dans ce chapitre) compte
39 recommandations. Voici les plus structurantes pour configurer un serveur.

## Versions et échange de clés

- **R3** : privilégier TLS 1.3 et accepter TLS 1.2. **R4** : refuser SSLv2, SSLv3, TLS 1.0 et 1.1.
- **R6** : toujours assurer la confidentialité persistante ; **R7** : échanger les clés avec ECDHE.

## Suites cryptographiques

- **R9** : privilégier AES ou ChaCha20 ; **R10** : un mode de chiffrement intègre (GCM, CCM,
  Poly1305) ; **R11** : SHA-2.
- Pour TLS 1.3, l'ANSSI liste `TLS_AES_256_GCM_SHA384`, `TLS_AES_128_GCM_SHA256`,
  `TLS_AES_128_CCM_SHA256` et `TLS_CHACHA20_POLY1305_SHA256`.
- Pour TLS 1.2, des suites comme `TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384`,
  `TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256` ou `TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256`.

## Certificat

- **R24** : signé avec SHA-2 ; **R26** : clés RSA d'au moins 2048 bits ou ECDSA d'au moins 256 bits
  pour une protection jusqu'en 2030 (le guide des mécanismes cryptographiques de 2026 exige 3072 bits
  pour RSA au-delà de 2030) ;
- **R27 à R29** : `keyUsage`, `extendedKeyUsage` et `subjectAltName` appropriés ;
- **R34** : envoyer une chaîne ordonnée et **complète** (n'oubliez pas l'intermédiaire).

## Autres points

- **R19** : pas de compression TLS ; **R20** : limiter la durée de vie des tickets de session ;
  **R23** : pas de données 0-RTT.
- Ajoutez l'en-tête HTTP **HSTS** pour que le navigateur n'essaie plus jamais le site en HTTP clair.

## Exemple : nginx

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name exemple.sn;

    ssl_certificate     /etc/ssl/exemple.sn/fullchain.pem;   # certificat + intermédiaires (R34)
    ssl_certificate_key /etc/ssl/exemple.sn/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;                           # R3, R4
    # Suites TLS 1.2 : ECDHE + AEAD uniquement (R7, R10). Celles de TLS 1.3 sont sûres par défaut.
    ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers on;                            # R13
    ssl_session_timeout 1h;                                  # R20
    ssl_early_data off;                                      # R23 : pas de 0-RTT

    add_header Strict-Transport-Security "max-age=63072000" always;   # HSTS, 2 ans
}
```

Après chaque modification : `nginx -t`, rechargement, puis un contrôle avec `testssl.sh` ou
SSL Labs.

## Côté client Java

Le client HTTP du JDK négocie TLS 1.3 par défaut et valide la chaîne avec le magasin `cacerts`.
Restreindre explicitement les versions :

```java
SSLParameters parametres = new SSLParameters();
parametres.setProtocols(new String[] {"TLSv1.3", "TLSv1.2"});

HttpClient client = HttpClient.newBuilder().sslParameters(parametres).build();
HttpResponse<String> reponse = client.send(
        HttpRequest.newBuilder(URI.create("https://exemple.sn")).build(),
        HttpResponse.BodyHandlers.ofString());
```

Ne désactivez **jamais** la vérification des certificats (`TrustManager` qui accepte tout) « pour
tester » : ce code finit toujours en production.
