-- Clés publiques Ed25519 ayant signé des certificats : conservées pour toujours, afin qu'un
-- certificat reste vérifiable même après une rotation de la clé de signature.
CREATE TABLE certificate_signing_keys (
  key_id     text        PRIMARY KEY,               -- 16 premiers caractères hex du SHA-256 de la clé publique
  algorithm  text        NOT NULL DEFAULT 'Ed25519',
  public_key bytea       NOT NULL,                  -- SubjectPublicKeyInfo (X.509, DER)
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE certificates ADD CONSTRAINT certificates_signing_key_fk
  FOREIGN KEY (signing_key_id) REFERENCES certificate_signing_keys(key_id);

CREATE INDEX quiz_attempts_passed_idx ON quiz_attempts (quiz_id, user_id) WHERE passed;
