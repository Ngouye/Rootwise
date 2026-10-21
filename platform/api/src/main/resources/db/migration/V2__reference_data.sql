-- Données de référence : salons par défaut, catégories du forum, tags et badges.

INSERT INTO conversations (type, slug, name, topic, post_policy) VALUES
  ('CHANNEL', 'general',     'général',     'Discussions libres de la communauté',        'ALL'),
  ('CHANNEL', 'aide-crypto', 'aide-crypto', 'Questions et entraide en cryptographie',     'ALL'),
  ('CHANNEL', 'veille-secu', 'veille-sécu', 'Actualités, vulnérabilités et publications', 'ALL'),
  ('CHANNEL', 'annonces',    'annonces',    'Annonces officielles de l''équipe',          'STAFF_ONLY');

INSERT INTO forum_categories (slug, name, position) VALUES
  ('mathematiques', 'Mathématiques',   1),
  ('programmation', 'Programmation',   2),
  ('algorithmes',   'Algorithmes',     3),
  ('emploi',        'Offres d''emploi', 4);

INSERT INTO tags (slug, name) VALUES
  ('aes',            'AES'),
  ('rsa',            'RSA'),
  ('ecc',            'Courbes elliptiques'),
  ('hachage',        'Hachage'),
  ('signature',      'Signature numérique'),
  ('pki',            'PKI'),
  ('tls',            'TLS'),
  ('post-quantique', 'Post-quantique');

INSERT INTO badges (code, name, description) VALUES
  ('WELCOME',                'Bienvenue',                 'A rejoint la communauté'),
  ('FIRST_COURSE_COMPLETED', 'Premier cours terminé',     'A terminé un cours et obtenu son certificat'),
  ('FIRST_ACCEPTED_ANSWER',  'Première réponse acceptée', 'Une de ses réponses a été acceptée au forum'),
  ('LAB_EXPLORER',           'Explorateur du Labo',       'A utilisé les cinq outils du Labo crypto');
