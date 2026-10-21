**Vidéo** : « Cryptographie — partie 5 : arithmétique pour RSA », chaîne YouTube *Exo7Math*
(Université de Lille). La vidéo est intégrée depuis YouTube et reste hébergée par son auteur.

Exo7 publie des cours de mathématiques universitaires complets et gratuits. Voici les outils
mathématiques dont RSA a besoin ; repérez-les pendant le visionnage :

- le petit théorème de Fermat et sa généralisation par Euler : $a^{\varphi(n)} \equiv 1 \pmod n$
  lorsque $a$ et $n$ sont premiers entre eux ;
- l'algorithme d'Euclide étendu, qui calcule l'inverse $d$ de $e$ modulo $\varphi(n)$ ;
- l'exponentiation rapide, qui rend le calcul de $m^e \bmod n$ possible pour des nombres de
  2 048 bits.

Exercice : retrouvez $d = 2753$ à partir de $e = 17$ et $\varphi(n) = 3120$ avec l'algorithme
d'Euclide étendu, comme dans l'exemple jouet du premier chapitre.
