Les courbes elliptiques ont remplacé RSA dans la plupart des usages modernes : TLS 1.3, SSH,
Signal, WireGuard, les cartes à puce et les cryptomonnaies. Elles offrent la même sécurité avec des
clés dix fois plus courtes.

Vous saurez à la fin :

- additionner des points sur une courbe définie sur un corps fini, et le faire **à la main** sur un
  petit exemple entièrement calculé ;
- expliquer pourquoi le **logarithme discret** sur courbe elliptique est difficile ;
- réaliser un échange de clés **ECDH / X25519** avec OpenSSL et Java ;
- signer avec **ECDSA**, et comprendre comment un nonce réutilisé livre la clé privée (calcul complet
  à l'appui) ;
- utiliser **Ed25519**, la signature qui protège aussi les certificats de cette plateforme.

Prérequis : l'arithmétique modulaire (inverse modulo $p$), vue dans le cours sur RSA.
