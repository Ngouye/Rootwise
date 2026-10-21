Signer, c'est prouver qu'un message vient bien du détenteur d'une clé privée et qu'il n'a pas été modifié :

1. on calcule une empreinte du message avec une fonction de hachage ;
2. on la transforme avec la **clé privée** : c'est la signature ;
3. n'importe qui la vérifie avec la **clé publique**.

![Deux chaînes de traitement : pour signer, le message passe dans une fonction de hachage puis l'empreinte est signée avec la clé privée ; pour vérifier, le message reçu est haché à nouveau et la signature est contrôlée avec la clé publique, ce qui donne valide ou non](images/signature-flux.png "Signer avec la clé privée, vérifier avec la clé publique")

Une signature apporte **intégrité**, **authenticité** et **non-répudiation**, mais pas la
confidentialité : le message reste lisible.

## Ed25519 en Java

```java
KeyPair paire = KeyPairGenerator.getInstance("Ed25519").generateKeyPair();

Signature signeur = Signature.getInstance("Ed25519");
signeur.initSign(paire.getPrivate());
signeur.update(message);
byte[] signature = signeur.sign(); // 64 octets

Signature verificateur = Signature.getInstance("Ed25519");
verificateur.initVerify(paire.getPublic());
verificateur.update(message);
boolean valide = verificateur.verify(signature);
```

Ed25519, sur courbe elliptique, offre une sécurité comparable à RSA-3072 avec des clés de 32 octets.
C'est l'algorithme qui signe les certificats de cette plateforme : chacun est vérifiable publiquement.
