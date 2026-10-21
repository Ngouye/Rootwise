La migration post-quantique est d'abord un **projet d'organisation**. Les grandes étapes sont
communes aux recommandations de l'ANSSI, du NIST et de leurs homologues.

## 1. Inventorier

On ne migre que ce que l'on connaît. Recensez où et comment la cryptographie asymétrique est
utilisée : protocoles (TLS, SSH, VPN IPsec), PKI et certificats, signatures de code et de
documents, chiffrement de données au repos, cartes à puce, équipements embarqués, bibliothèques et
dépendances. Le format **CBOM** (*Cryptography Bill of Materials*) de CycloneDX permet de décrire
cet inventaire de façon outillée.

## 2. Prioriser

- les données à **longue durée de confidentialité**, exposées à « stocker maintenant, déchiffrer
  plus tard » : l'**échange de clés** d'abord ;
- les systèmes à **longue durée de vie** et difficiles à mettre à jour (industrie, spatial,
  automobile, objets connectés) ;
- les **racines de confiance** (autorités de certification, clés de signature de micrologiciels),
  qui doivent durer des décennies.

## 3. Devenir crypto-agile

Un système **crypto-agile** peut changer d'algorithme sans être réécrit :

- algorithmes et tailles configurables, identifiants d'algorithme présents dans les formats de
  données ;
- aucune taille de clé ou de signature codée en dur : un tampon de 64 octets prévu pour une
  signature ECDSA ne contiendra pas 3 309 octets de ML-DSA ;
- des tests d'interopérabilité avec les nouvelles versions des bibliothèques.

## 4. Déployer l'hybride, puis le post-quantique

1. Activer l'échange de clés hybride là où il est disponible : TLS 1.3 (`X25519MLKEM768`),
   SSH (`mlkem768x25519-sha256`) ;
2. mettre à jour bibliothèques et matériels : OpenSSL 3.5 ou plus, Java 24 ou plus, HSM compatibles ;
3. introduire des signatures post-quantiques hybrides lorsque les normes de certificats et de
   protocoles seront stabilisées.

## Le calendrier

- **Août 2024** : publication de FIPS 203, 204 et 205 par le NIST.
- **Mars 2025** : le NIST retient **HQC**, fondé sur les codes correcteurs, comme second KEM.
- **1er janvier 2030** : au-delà de cette date, l'ANSSI recommande de viser une sécurité
  post-quantique ; elle relève aussi la taille minimale des modules RSA et des groupes
  Diffie-Hellman à **3 072 bits** pour toute utilisation à partir de 2031.
- **2030–2035** : le projet de rapport NIST IR 8547 (2024) prévoit de déprécier après 2030 les
  algorithmes vulnérables au quantique offrant 112 bits de sécurité (comme RSA-2048), puis
  d'interdire tous les algorithmes à clé publique vulnérables après 2035.

> La cryptographie post-quantique ne remplace pas la cryptographie symétrique : AES-256, SHA-384 et
> HMAC restent au cœur des systèmes. C'est une excellente nouvelle.
