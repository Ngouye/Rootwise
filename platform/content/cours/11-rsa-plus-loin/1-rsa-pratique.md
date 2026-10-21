Le « RSA de manuel » ($c = m^e \bmod n$) vu au premier chapitre ne doit **jamais** être utilisé tel
quel. Voici pourquoi, et ce que l'on utilise à la place.

## Deux défauts du RSA de manuel

**Il est déterministe.** Le même message donne toujours le même chiffré. Si l'ensemble des messages
possibles est petit (« oui » / « non », un montant, un code), l'attaquant chiffre chaque candidat
avec la clé publique et compare.

**Il est malléable.** Avec la clé jouet du premier chapitre ($n = 3233$, $e = 17$, $d = 2753$) :

- le message $m = 65$ donne $c = 2790$ ;
- sans connaître $d$, l'attaquant calcule $c' = c \cdot 2^{e} \bmod n = 2790 \times 1752 \bmod 3233 = 3017$ ;
- le destinataire déchiffre $c'$ et obtient $3017^{2753} \bmod 3233 = 130 = 2 \times 65$.

L'attaquant a doublé le message sans savoir ce qu'il contenait, car $(m^e)(2^e) = (2m)^e$.

## Le remède : un bourrage aléatoire et structuré

| Usage | Mécanisme recommandé | À éviter |
|---|---|---|
| Chiffrement | **RSA-OAEP** (PKCS #1 v2) | PKCS #1 v1.5, RSA de manuel |
| Signature | **RSA-PSS** (PKCS #1 v2) | PKCS #1 v1.5 mal vérifié, RSA de manuel |

**OAEP** mélange le message avec un aléa au moyen de deux fonctions de hachage avant
l'exponentiation : le chiffré devient probabiliste et toute modification le rend invalide.
**PSS** fait de même pour les signatures, avec une preuve de sécurité.

L'ancien bourrage PKCS #1 v1.5 a causé des attaques célèbres :

- **Bleichenbacher (1998)** : un serveur qui indique si le bourrage d'un chiffré est correct (un
  « oracle de bourrage ») permet de déchiffrer n'importe quel message en quelques centaines de
  milliers de requêtes. L'attaque **ROBOT** a montré en 2017 que des serveurs TLS de grands éditeurs
  y étaient encore vulnérables ;
- **Bleichenbacher (2006)** : avec $e = 3$ et une vérification laxiste du bourrage, on peut forger
  des signatures.

Le guide ANSSI des mécanismes cryptographiques (2026) déclare RSAES-OAEP et RSA-SSA-PSS conformes,
et PKCS #1 v1.5 non conforme dans ces situations.

## Les tailles de clés

Règle *RègleFactorisation* du guide ANSSI (2026) :

- module d'**au moins 2048 bits** pour une utilisation qui ne dépasse pas la fin de 2030 ;
- **au moins 3072 bits** pour une utilisation à partir de 2031, taille déjà recommandée aujourd'hui ;
- exposant public **strictement supérieur à $2^{16} = 65536$** : la valeur usuelle $e = 65537$
  convient.

## En pratique avec OpenSSL

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out rsa.key
openssl pkey -in rsa.key -pubout -out rsa.pub
openssl pkey -in rsa.key -noout -text | grep -E "Private-Key|publicExponent"
# Private-Key: (3072 bit, 2 primes)
# publicExponent: 65537 (0x10001)

# Chiffrer un secret de 32 octets avec OAEP (SHA-256)
openssl rand -out secret.bin 32
openssl pkeyutl -encrypt -pubin -inkey rsa.pub -pkeyopt rsa_padding_mode:oaep \
  -pkeyopt rsa_oaep_md:sha256 -in secret.bin -out secret.enc          # 384 octets
openssl pkeyutl -decrypt -inkey rsa.key -pkeyopt rsa_padding_mode:oaep \
  -pkeyopt rsa_oaep_md:sha256 -in secret.enc -out secret.dec

# Signer et vérifier avec PSS
openssl dgst -sha256 -sigopt rsa_padding_mode:pss -sigopt rsa_pss_saltlen:-1 \
  -sign rsa.key -out signature.bin message.txt
openssl dgst -sha256 -sigopt rsa_padding_mode:pss -sigopt rsa_pss_saltlen:-1 \
  -verify rsa.pub -signature signature.bin message.txt                # Verified OK
```

## En Java

```java
KeyPairGenerator generateur = KeyPairGenerator.getInstance("RSA");
generateur.initialize(3072);
KeyPair paire = generateur.generateKeyPair();

// Chiffrement OAEP : préciser explicitement SHA-256 pour le hachage ET pour MGF1
OAEPParameterSpec oaep = new OAEPParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256,
        PSource.PSpecified.DEFAULT);
Cipher rsa = Cipher.getInstance("RSA/ECB/OAEPPadding");
rsa.init(Cipher.ENCRYPT_MODE, paire.getPublic(), oaep);
byte[] chiffre = rsa.doFinal(cleAes);

// Signature PSS
Signature pss = Signature.getInstance("RSASSA-PSS");
pss.setParameter(new PSSParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256, 32, 1));
pss.initSign(paire.getPrivate());
pss.update(message);
byte[] signature = pss.sign();
```

## Où RSA est encore utilisé

On ne chiffre presque jamais des données directement avec RSA : il sert au mieux à transporter une
clé symétrique (chiffrement hybride), et TLS 1.3 a même supprimé cet usage au profit d'ECDHE. RSA
reste en revanche très présent pour les **signatures** : certificats d'autorités, signature de code,
et `rsa_pss_rsae_sha256` dans TLS 1.3. Comme les courbes elliptiques, il sera cassé par un ordinateur
quantique suffisant : voir le cours *Cryptographie post-quantique*.
