## Avec OpenSSL

```bash
openssl s_client -connect cloudflare.com:443 -servername cloudflare.com -tls1_3 </dev/null
```

Dans la sortie, repérez ces lignes (obtenues avec OpenSSL 3.5 en 2026 ; le résultat dépend du
serveur et de votre version d'OpenSSL) :

```text
Peer signature type: ecdsa_secp256r1_sha256     ← signature de CertificateVerify
Negotiated TLS1.3 group: X25519MLKEM768         ← échange de clés hybride post-quantique
New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384  ← suite symétrique
```

Le groupe `X25519MLKEM768` combine X25519 et ML-KEM : la connexion est déjà protégée contre un
futur ordinateur quantique. Le cours *Cryptographie post-quantique* explique comment.

Quelques variantes utiles :

```bash
# Imposer un groupe d'échange de clés
openssl s_client -connect exemple.sn:443 -groups x25519 </dev/null

# Voir toute la chaîne de certificats envoyée par le serveur
openssl s_client -connect exemple.sn:443 -showcerts </dev/null

# Date d'expiration du certificat
openssl s_client -connect exemple.sn:443 </dev/null 2>/dev/null | openssl x509 -noout -enddate
```

## Avec curl

```bash
curl -sv https://cloudflare.com -o /dev/null 2>&1 | grep -E "SSL connection|ALPN|subject|expire"
```

## Avec Wireshark

Le trafic est chiffré… sauf si vous disposez des clés de session. Les navigateurs et curl les
écrivent dans un fichier quand la variable d'environnement `SSLKEYLOGFILE` est définie :

```bash
export SSLKEYLOGFILE=$HOME/cles-tls.log
curl https://exemple.sn
```

Dans Wireshark, indiquez ce fichier dans les préférences du protocole TLS (*(Pre)-Master-Secret
log filename*) : `EncryptedExtensions`, `Certificate`, `CertificateVerify` et `Finished` deviennent
lisibles. C'est le meilleur moyen de relier la leçon précédente à la réalité. N'utilisez cette
technique que sur votre propre trafic, et supprimez le fichier ensuite : il permet de tout
déchiffrer.

## Outils d'audit

- **SSL Labs** (`ssllabs.com/ssltest`) : note de A+ à F pour un site public ;
- **testssl.sh** : script libre, utilisable aussi sur des serveurs internes ; il signale notamment
  les anciennes versions du protocole encore acceptées ;
- l'onglet *Sécurité* des outils de développement du navigateur.
