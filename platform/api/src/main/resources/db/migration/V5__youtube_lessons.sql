-- Leçons vidéo hébergées sur YouTube (intégration, sans téléchargement) et notes facultatives
-- sous les vidéos et PDF.
ALTER TABLE lessons ADD COLUMN youtube_id text CHECK (youtube_id ~ '^[A-Za-z0-9_-]{11}$');

ALTER TABLE lessons DROP CONSTRAINT lessons_type_check;
ALTER TABLE lessons ADD CONSTRAINT lessons_type_check CHECK (type IN ('VIDEO', 'PDF', 'TEXT', 'YOUTUBE'));

-- Texte obligatoire pour une leçon TEXT ; fichier pour VIDEO/PDF ; identifiant YouTube pour YOUTUBE.
-- content_md sert désormais aussi de notes pour les autres types.
ALTER TABLE lessons DROP CONSTRAINT lessons_check;
ALTER TABLE lessons ADD CONSTRAINT lessons_content_check CHECK (
     (type = 'TEXT'    AND content_md IS NOT NULL)
  OR (type IN ('VIDEO', 'PDF') AND media_id IS NOT NULL)
  OR (type = 'YOUTUBE' AND youtube_id IS NOT NULL)
);
