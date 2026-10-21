ECDSA (*Elliptic Curve Digital Signature Algorithm*, FIPS 186-5) est la signature la plus répandue
sur les certificats TLS. Clé privée $d$, clé publique $Q = dG$, avec $G$ d'ordre $n$.

## Signer un message $m$

1. $h = H(m)$, converti en entier (et tronqué à la taille de $n$) ;
2. tirer un **nonce** $k$ aléatoire, secret et **unique**, dans $[1, n-1]$ ;
3. $R = kG$ et $r = x_R \bmod n$ ;
4. $s = k^{-1}\,(h + r\,d) \bmod n$.

La signature est le couple $(r, s)$ : 64 octets pour P-256 (environ 72 dans l'encodage DER utilisé
par les certificats).

## Vérifier

1. $w = s^{-1} \bmod n$, puis $u_1 = h\,w \bmod n$ et $u_2 = r\,w \bmod n$ ;
2. $X = u_1 G + u_2 Q$ ;
3. la signature est valide si $x_X \bmod n = r$.

Pourquoi ça marche : $w = s^{-1} = \dfrac{k}{h + rd}$, donc
$u_1 G + u_2 Q = (h + r d)\,w\,G = kG = R$.

## Le piège : réutiliser $k$

Deux signatures $(r, s_1)$ et $(r, s_2)$ de messages différents calculées avec le **même** $k$ ont
le même $r$, et :

$$s_1 - s_2 = k^{-1}(h_1 - h_2) \;\Longrightarrow\; k = \frac{h_1 - h_2}{s_1 - s_2} \bmod n \;\Longrightarrow\; d = \frac{s_1 k - h_1}{r} \bmod n$$

**La clé privée tombe avec deux signatures.** Vérifions-le sur la courbe jouet du chapitre 1
($n = 19$), avec la clé privée $d = 7$ (donc $Q = 7G = (0, 6)$) et le même $k = 10$ pour deux
messages d'empreintes $h_1 = 5$ et $h_2 = 11$ :

- $R = 10G = (7, 11)$, donc $r = 7$ ; $k^{-1} = 2$ car $10 \times 2 = 20 \equiv 1$ ;
- $s_1 = 2 \times (5 + 7 \times 7) = 108 \equiv 13$ et $s_2 = 2 \times (11 + 49) = 120 \equiv 6$ ;
- l'attaquant, qui ne voit que $(r, s_1, s_2, h_1, h_2)$, calcule
  $k = (5 - 11)(13 - 6)^{-1} = 13 \times 11 = 143 \equiv 10$ (car $-6 \equiv 13$ et $7^{-1} \equiv 11$) ;
- puis $d = (13 \times 10 - 5) \times 7^{-1} = 125 \times 11 \equiv 11 \times 11 = 121 \equiv 7$. ✓

Ce n'est pas théorique :

- fin 2010, le groupe fail0verflow a extrait la clé de signature de Sony pour la **PlayStation 3**,
  dont le logiciel utilisait un $k$ constant ;
- en 2013, un défaut du générateur aléatoire d'Android a produit des nonces répétés, et des
  portefeuilles Bitcoin ont été vidés.

Même un $k$ **partiellement** prévisible (quelques bits biaisés) suffit, avec assez de signatures,
à retrouver la clé par des attaques sur les réseaux euclidiens.

## Les parades

- **ECDSA déterministe** (RFC 6979, reprise dans FIPS 186-5) : $k$ est dérivé de la clé privée et de
  $H(m)$ par HMAC-DRBG. Même message ⇒ même signature ; messages différents ⇒ nonces différents.
- N'utiliser que des bibliothèques éprouvées, jamais une implémentation maison.
- Préférer Ed25519, déterministe par conception (leçon suivante).

## En pratique

```bash
openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out ec.key
openssl pkey -in ec.key -pubout -out ec.pub
openssl dgst -sha256 -sign ec.key -out signature.der message.txt
openssl dgst -sha256 -verify ec.pub -signature signature.der message.txt   # Verified OK
openssl asn1parse -inform DER -in signature.der                            # affiche r et s
```

```java
KeyPairGenerator generateur = KeyPairGenerator.getInstance("EC");
generateur.initialize(new ECGenParameterSpec("secp256r1"));
KeyPair paire = generateur.generateKeyPair();

Signature ecdsa = Signature.getInstance("SHA256withECDSA");
ecdsa.initSign(paire.getPrivate());
ecdsa.update(message);
byte[] signature = ecdsa.sign(); // encodage DER de (r, s)
```
