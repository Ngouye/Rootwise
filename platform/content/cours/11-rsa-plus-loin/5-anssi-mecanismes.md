**Document officiel** : ANSSI, *Règles et recommandations concernant le choix et le dimensionnement
des mécanismes cryptographiques*, ANSSI-PG-083 du 20 mars 2026, en français. Document publié sous la
**Licence Ouverte v2.0** (Etalab), qui autorise sa rediffusion avec mention de la source et de la
date. Original : [cyber.gouv.fr](https://cyber.gouv.fr).

Le référentiel français des mécanismes cryptographiques, mis à jour en 2026 avec des règles
post-quantiques. Chaque règle porte un nom (*RègleFactorisation*, *RègleHachage*…) et est suivie de
mécanismes **conformes** et **non conformes**.

Guide de lecture pour ce cours :

- les règles générales du début, dont la recommandation *RecoSécuLongTerme* (viser une sécurité
  post-quantique pour tout usage au-delà du 1er janvier 2030) ;
- *RègleFactorisation* : les tailles de modules RSA et d'exposants publics ;
- les sections sur le **chiffrement asymétrique** et la **signature numérique** : RSAES-OAEP et
  RSA-SSA-PSS conformes, PKCS #1 v1.5 non conforme dans les situations décrites dans la leçon
  « RSA en pratique » ;
- les règles sur les courbes elliptiques et sur les mécanismes post-quantiques (ML-KEM, ML-DSA,
  SLH-DSA), qui prolongent les cours *Courbes elliptiques* et *Cryptographie post-quantique*.
