Les fonctions de hachage sont partout : vérification des téléchargements, signatures numériques,
Git, blockchains, stockage des mots de passe. Ce cours part de la définition d'une empreinte pour
arriver aux bonnes pratiques actuelles.

Vous saurez à la fin :

- expliquer les propriétés de sécurité d'une fonction de hachage et le paradoxe des anniversaires ;
- décrire le fonctionnement interne de **SHA-256** (Merkle–Damgård) et de **SHA-3** (éponge) ;
- authentifier un message avec **HMAC** sans tomber dans le piège de l'extension de longueur ;
- stocker des mots de passe correctement avec **Argon2id**.

Le cours s'appuie sur les normes officielles **FIPS 180-4**, **FIPS 202** et la **RFC 9106**, fournies
en PDF, sur des vidéos de vulgarisation francophones, et sur des commandes OpenSSL et du code Java
à essayer vous-même.
