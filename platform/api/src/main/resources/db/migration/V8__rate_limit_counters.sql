-- Compteurs anti-abus (connexion, réinitialisation de mot de passe), auparavant dans Redis :
-- une ligne par clé (adresse IP ou empreinte d'e-mail), remise à zéro à l'expiration de sa fenêtre.
-- UNLOGGED : données jetables, non journalisées (écritures plus rapides) ; une panne du serveur
-- les efface, ce qui revient seulement à rouvrir les fenêtres en cours.
CREATE UNLOGGED TABLE rate_limit_counters (
  counter_key text        PRIMARY KEY,
  hits        integer     NOT NULL,
  expires_at  timestamptz NOT NULL
);
CREATE INDEX rate_limit_counters_expires_idx ON rate_limit_counters (expires_at);
