Chaque connexion HTTPS commence par une question : **cette clé publique appartient-elle vraiment au
site que je veux joindre ?** Les infrastructures à clés publiques (PKI, ou IGC en français) et les
certificats X.509 y répondent.

Vous saurez à la fin :

- expliquer la chaîne de confiance, du certificat d'un site jusqu'à une autorité racine ;
- lire et interpréter tous les champs d'un certificat X.509 v3 ;
- créer **votre propre autorité de certification** et signer un certificat serveur avec OpenSSL
  (commandes testées) ;
- décrire la validation d'une chaîne, la révocation (CRL, OCSP), Certificate Transparency et
  l'évolution vers des certificats de courte durée.

Prérequis : les signatures numériques (cours *RSA et signatures numériques* ou *Courbes
elliptiques*).
