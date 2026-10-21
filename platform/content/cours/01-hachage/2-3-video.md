**Vidéo** : « Les rouages de SHA256 — chapitre 2.2 [Crypto 301] », chaîne YouTube
*Découvre Bitcoin*. La vidéo est intégrée depuis YouTube et reste hébergée par son auteur.

C'est une plongée longue et détaillée dans l'algorithme : gardez la leçon sur SHA-256 et la norme
FIPS 180-4 (leçon suivante) ouvertes à côté.

Repères à suivre pendant le visionnage :

- le **remplissage** du message et le codage de sa longueur ;
- l'**expansion** de chaque bloc de 16 mots en 64 mots avec $\sigma_0$ et $\sigma_1$ ;
- un **tour** de compression : le calcul de $T_1$ et $T_2$ à partir de $\Sigma_0$, $\Sigma_1$,
  $Ch$, $Maj$ et de la constante $K_t$ ;
- l'addition finale avec l'état précédent, qui rend la fonction de compression non inversible.
