**Vidéo** : « Le chiffrement symétrique — AES expliqué », chaîne YouTube *Mickaël Dupont*. La vidéo
est intégrée depuis YouTube et reste hébergée par son auteur.

Pendant le visionnage, repérez les quatre opérations d'un tour d'AES, que vous retrouverez dans la
norme FIPS 197 (leçon suivante) :

| Opération | Rôle |
|---|---|
| `SubBytes` | substitution non linéaire de chaque octet par la table S-box (confusion) |
| `ShiftRows` | décalage circulaire des lignes de l'état (diffusion) |
| `MixColumns` | mélange de chaque colonne par une multiplication dans $\mathrm{GF}(2^8)$ (diffusion) |
| `AddRoundKey` | combinaison par XOR avec la sous-clé du tour |

AES chiffre des blocs de 128 bits en 10, 12 ou 14 tours selon la taille de la clé (128, 192 ou
256 bits) ; le dernier tour omet `MixColumns`.
