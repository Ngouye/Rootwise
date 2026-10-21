Un ordinateur quantique suffisamment puissant casserait RSA, Diffie-Hellman et toutes les courbes
elliptiques. Il n'existe pas encore, mais des données enregistrées aujourd'hui pourraient être
déchiffrées demain. La migration a commencé : les standards du NIST sont publiés depuis août 2024,
et votre navigateur utilise déjà un échange de clés hybride post-quantique.

Vous saurez à la fin :

- expliquer ce que les algorithmes de **Shor** et de **Grover** menacent réellement ;
- décrire **ML-KEM** (FIPS 203), **ML-DSA** (FIPS 204) et **SLH-DSA** (FIPS 205), leurs tailles et
  leurs compromis, et les essayer avec OpenSSL 3.5 ;
- comprendre l'**hybridation** et son déploiement dans TLS 1.3 (`X25519MLKEM768`) ;
- préparer une migration selon les recommandations de l'**ANSSI**.

Le cours s'appuie sur les trois normes du NIST et sur la fiche technique de l'ANSSI consacrée à
TLS 1.3 (février 2026), fournies en PDF.
