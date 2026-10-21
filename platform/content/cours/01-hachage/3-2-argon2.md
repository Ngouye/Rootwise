Une base de données finit toujours par fuiter un jour. La vraie question est : **que peut faire
l'attaquant avec les empreintes de mots de passe volées ?**

## Pourquoi SHA-256 ne suffit pas

Une carte graphique récente calcule des **milliards** de SHA-256 par seconde. Un mot de passe
choisi par un humain (mot du dictionnaire, prénom, date, variantes) tombe en quelques secondes.
Et sans **sel**, deux comptes ayant le même mot de passe ont la même empreinte, que des tables
précalculées permettent de retrouver instantanément.

Une fonction de stockage de mots de passe doit donc être :

1. **salée** : un sel aléatoire d'au moins 16 octets, unique par compte, stocké en clair à côté de
   l'empreinte ;
2. **lente et réglable** : un paramètre de coût que l'on augmente avec les années ;
3. **gourmande en mémoire** : les GPU et circuits spécialisés disposent d'énormément de calcul mais
   de peu de mémoire par cœur ; exiger beaucoup de mémoire leur retire leur avantage.

## Argon2id

Argon2 a remporté la *Password Hashing Competition* en 2015 et est décrit dans la **RFC 9106**
(2021). Il prend trois paramètres de coût :

| Paramètre | Rôle |
|---|---|
| $m$ | quantité de mémoire utilisée |
| $t$ | nombre de passes sur cette mémoire |
| $p$ | parallélisme (nombre de voies calculées en parallèle) |

La variante **Argon2id** combine Argon2i (accès mémoire indépendants du mot de passe, contre les
attaques par canaux auxiliaires) et Argon2d (accès dépendants des données, contre les GPU). C'est
elle qu'il faut choisir.

Réglages publiés :

- **RFC 9106, premier choix** : $t = 1$, $p = 4$, $m = 2$ Gio ;
- **RFC 9106, second choix** (mémoire limitée) : $t = 3$, $p = 4$, $m = 64$ Mio ;
- **OWASP, configuration minimale** : $m = 19$ Mio, $t = 2$, $p = 1$.

En pratique : visez de l'ordre d'une demi-seconde de calcul sur votre serveur, avec le plus de
mémoire que vous pouvez vous permettre face au nombre de connexions simultanées.

## Ce que fait cette plateforme

Votre mot de passe est haché avec **Argon2id** ($m = 19$ Mio, $t = 2$, $p = 1$, sel de 16 octets,
empreinte de 32 octets). En base, on ne trouve qu'une chaîne de la forme :

```text
{argon2}$argon2id$v=19$m=19456,t=2,p=1$<sel en Base64>$<empreinte en Base64>
```

Tout y figure : algorithme, version, paramètres et sel. On peut donc augmenter les paramètres plus
tard sans rendre les anciens hachages invérifiables.

```java
// Spring Security : sel 16 octets, empreinte 32 octets, p = 1, m = 19 Mio, t = 2
PasswordEncoder encodeur = new Argon2PasswordEncoder(16, 32, 1, 19 * 1024, 2);
String stocke = encodeur.encode("une phrase de passe longue");
boolean ok = encodeur.matches("une phrase de passe longue", stocke);
```

## Et les autres ?

- **bcrypt** (1999) et **scrypt** restent acceptables.
- **PBKDF2** seulement si une norme l'impose, avec un très grand nombre d'itérations (l'OWASP
  recommande 600 000 itérations pour PBKDF2-HMAC-SHA256).
- Une **phrase de passe** longue vaut mieux qu'un mot de passe court truffé de symboles, et rien ne
  remplace l'authentification à plusieurs facteurs.
