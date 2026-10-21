-- Distingue un jeton remplacé par rotation (rotated_at) d'un jeton révoqué (revoked_at) :
-- deux onglets qui rafraîchissent en même temps ne doivent pas être pris pour un vol de jeton.
ALTER TABLE refresh_tokens ADD COLUMN rotated_at timestamptz;
CREATE INDEX refresh_tokens_family_idx ON refresh_tokens (family_id);
