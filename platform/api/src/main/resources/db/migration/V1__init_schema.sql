-- Schéma initial de la plateforme (voir étape 1 : architecture & modèle de données).
CREATE EXTENSION IF NOT EXISTS citext;

-- ===================== 1. IDENTITÉ & GAMIFICATION =====================
CREATE TABLE users (
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email             citext NOT NULL UNIQUE,
  username          citext NOT NULL UNIQUE,
  password_hash     text,                                 -- NULL si compte 100 % OAuth
  display_name      text   NOT NULL,
  bio               text,
  avatar_media_id   bigint,
  expertise_level   text   NOT NULL DEFAULT 'BEGINNER' CHECK (expertise_level IN ('BEGINNER','INTERMEDIATE','EXPERT')),
  reputation        int    NOT NULL DEFAULT 0,
  status            text   NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','DELETED')),
  token_version     int    NOT NULL DEFAULT 0,            -- +1 => tous ses JWT sont révoqués
  email_verified_at timestamptz,
  last_seen_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       text   NOT NULL CHECK (role IN ('ADMIN','CREATOR','MODERATOR','MEMBER')),
  granted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE oauth_accounts (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider         text   NOT NULL CHECK (provider IN ('GOOGLE','GITHUB')),
  provider_user_id text   NOT NULL,
  UNIQUE (provider, provider_user_id)
);

CREATE TABLE refresh_tokens (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash bytea  NOT NULL UNIQUE,                      -- SHA-256 ; le jeton brut n'est jamais stocké
  family_id  uuid   NOT NULL,                             -- rotation + détection de réutilisation
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX refresh_tokens_user_idx ON refresh_tokens (user_id);

CREATE TABLE auth_tokens (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose    text   NOT NULL CHECK (purpose IN ('VERIFY_EMAIL','RESET_PASSWORD')),
  token_hash bytea  NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz
);

CREATE TABLE badges (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        text NOT NULL UNIQUE,
  name        text NOT NULL,
  description text NOT NULL,
  icon_url    text
);

CREATE TABLE user_badges (
  user_id    bigint NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  badge_id   bigint NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- ===================== 2. TRANSVERSAL : FICHIERS & TAGS =====================
CREATE TABLE media_assets (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id         bigint REFERENCES users(id) ON DELETE SET NULL,
  kind             text   NOT NULL CHECK (kind IN ('VIDEO','PDF','IMAGE','ATTACHMENT')),
  storage_key      text   NOT NULL UNIQUE,                -- générée par le serveur, jamais par le client
  original_name    text   NOT NULL,
  mime_type        text   NOT NULL,
  size_bytes       bigint NOT NULL,
  sha256           bytea,
  duration_seconds int,
  status           text   NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','READY','FAILED')),
  created_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE users ADD CONSTRAINT users_avatar_fk
  FOREIGN KEY (avatar_media_id) REFERENCES media_assets(id) ON DELETE SET NULL;

CREATE TABLE tags (
  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL
);

-- ===================== 3. E-LEARNING =====================
CREATE TABLE courses (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug           text   NOT NULL UNIQUE,
  title          text   NOT NULL,
  summary        text   NOT NULL,
  description_md text,
  level          text   NOT NULL CHECK (level IN ('BEGINNER','INTERMEDIATE','EXPERT')),
  author_id      bigint NOT NULL REFERENCES users(id),
  cover_media_id bigint REFERENCES media_assets(id) ON DELETE SET NULL,
  status         text   NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  published_at   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE course_tags (
  course_id bigint NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tag_id    bigint NOT NULL REFERENCES tags(id)    ON DELETE CASCADE,
  PRIMARY KEY (course_id, tag_id)
);

CREATE TABLE chapters (
  id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id bigint NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  position  int    NOT NULL,
  title     text   NOT NULL,
  UNIQUE (course_id, position) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE lessons (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chapter_id       bigint NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  position         int    NOT NULL,
  title            text   NOT NULL,
  type             text   NOT NULL CHECK (type IN ('VIDEO','PDF','TEXT')),
  content_md       text,
  media_id         bigint REFERENCES media_assets(id) ON DELETE RESTRICT,
  duration_seconds int,
  is_free_preview  boolean NOT NULL DEFAULT false,
  UNIQUE (chapter_id, position) DEFERRABLE INITIALLY DEFERRED,
  CHECK ((type = 'TEXT' AND content_md IS NOT NULL) OR (type <> 'TEXT' AND media_id IS NOT NULL))
);

CREATE TABLE enrollments (
  user_id        bigint   NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  course_id      bigint   NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_pct   smallint NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  last_lesson_id bigint   REFERENCES lessons(id) ON DELETE SET NULL,
  enrolled_at    timestamptz NOT NULL DEFAULT now(),
  completed_at   timestamptz,
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE lesson_progress (
  user_id          bigint NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  lesson_id        bigint NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  position_seconds int    NOT NULL DEFAULT 0,
  completed_at     timestamptz,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE quizzes (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chapter_id     bigint   NOT NULL UNIQUE REFERENCES chapters(id) ON DELETE CASCADE,
  pass_score_pct smallint NOT NULL DEFAULT 70 CHECK (pass_score_pct BETWEEN 0 AND 100),
  max_attempts   smallint,
  time_limit_sec int
);

CREATE TABLE quiz_questions (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  quiz_id        bigint   NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  position       int      NOT NULL,
  kind           text     NOT NULL CHECK (kind IN ('SINGLE','MULTIPLE')),
  prompt_md      text     NOT NULL,
  explanation_md text,
  points         smallint NOT NULL DEFAULT 1
);

CREATE TABLE quiz_choices (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question_id bigint  NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  position    int     NOT NULL,
  label_md    text    NOT NULL,
  is_correct  boolean NOT NULL                            -- jamais envoyé au client avant correction
);

CREATE TABLE quiz_attempts (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  quiz_id      bigint NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id      bigint NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  started_at   timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  score_pct    smallint,
  passed       boolean
);
CREATE INDEX quiz_attempts_user_idx ON quiz_attempts (user_id, quiz_id);

CREATE TABLE quiz_attempt_answers (
  attempt_id  bigint NOT NULL REFERENCES quiz_attempts(id)  ON DELETE CASCADE,
  question_id bigint NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  choice_id   bigint NOT NULL REFERENCES quiz_choices(id)   ON DELETE CASCADE,
  PRIMARY KEY (attempt_id, question_id, choice_id)
);

CREATE TABLE certificates (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        bigint NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  course_id      bigint NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  serial         uuid   NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  payload        jsonb  NOT NULL,
  signature      bytea  NOT NULL,                         -- Ed25519 de la plateforme
  signing_key_id text   NOT NULL,
  issued_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- ===================== 4. CHAT =====================
CREATE TABLE conversations (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type            text    NOT NULL CHECK (type IN ('CHANNEL','DM')),
  slug            text    UNIQUE,
  name            text,
  topic           text,
  is_private      boolean NOT NULL DEFAULT false,
  post_policy     text    NOT NULL DEFAULT 'ALL' CHECK (post_policy IN ('ALL','STAFF_ONLY')),
  dm_key          text    UNIQUE,                         -- 'idMin:idMax' => un seul DM par paire
  created_by      bigint  REFERENCES users(id) ON DELETE SET NULL,
  last_message_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CHECK ((type = 'CHANNEL' AND slug IS NOT NULL AND dm_key IS NULL)
      OR (type = 'DM'      AND dm_key IS NOT NULL AND slug IS NULL))
);

CREATE TABLE conversation_members (
  conversation_id      bigint NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id              bigint NOT NULL REFERENCES users(id)         ON DELETE CASCADE,
  last_read_message_id bigint,
  muted_until          timestamptz,
  joined_at            timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX conversation_members_user_idx ON conversation_members (user_id);

CREATE TABLE messages (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id bigint NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  author_id       bigint REFERENCES users(id) ON DELETE SET NULL,
  body_md         text   NOT NULL CHECK (length(body_md) <= 4000),
  reply_to_id     bigint REFERENCES messages(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  edited_at       timestamptz,
  deleted_at      timestamptz
);
CREATE INDEX messages_conversation_idx ON messages (conversation_id, id DESC);

CREATE TABLE message_attachments (
  message_id bigint NOT NULL REFERENCES messages(id)     ON DELETE CASCADE,
  media_id   bigint NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  PRIMARY KEY (message_id, media_id)
);

-- ===================== 5. FORUM =====================
CREATE TABLE forum_categories (
  id       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug     text NOT NULL UNIQUE,
  name     text NOT NULL,
  position int  NOT NULL
);

CREATE TABLE threads (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id      bigint  NOT NULL REFERENCES forum_categories(id),
  author_id        bigint  REFERENCES users(id) ON DELETE SET NULL,
  title            text    NOT NULL CHECK (length(title) BETWEEN 10 AND 200),
  slug             text    NOT NULL,
  status           text    NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED','ARCHIVED')),
  is_pinned        boolean NOT NULL DEFAULT false,
  accepted_post_id bigint,
  answer_count     int     NOT NULL DEFAULT 0,
  view_count       int     NOT NULL DEFAULT 0,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);
CREATE INDEX threads_category_activity_idx ON threads (category_id, last_activity_at DESC);
CREATE INDEX threads_title_fts ON threads USING GIN (to_tsvector('french', title));

CREATE TABLE thread_tags (
  thread_id bigint NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  tag_id    bigint NOT NULL REFERENCES tags(id)    ON DELETE CASCADE,
  PRIMARY KEY (thread_id, tag_id)
);

CREATE TABLE posts (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  thread_id     bigint  NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  author_id     bigint  REFERENCES users(id) ON DELETE SET NULL,
  is_question   boolean NOT NULL DEFAULT false,
  body_md       text    NOT NULL,
  score         int     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  edited_at     timestamptz,
  deleted_at    timestamptz,
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('french', body_md)) STORED
);
CREATE UNIQUE INDEX posts_one_question_per_thread ON posts (thread_id) WHERE is_question;
CREATE INDEX posts_thread_idx ON posts (thread_id, created_at);
CREATE INDEX posts_fts ON posts USING GIN (search_vector);
ALTER TABLE threads ADD CONSTRAINT threads_accepted_post_fk
  FOREIGN KEY (accepted_post_id) REFERENCES posts(id) ON DELETE SET NULL;

CREATE TABLE post_votes (
  post_id  bigint   NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id  bigint   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value    smallint NOT NULL CHECK (value IN (-1, 1)),
  voted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- ===================== 6. BLOG & VEILLE =====================
CREATE TABLE articles (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  author_id      bigint REFERENCES users(id) ON DELETE SET NULL,
  slug           text   NOT NULL UNIQUE,
  title          text   NOT NULL,
  excerpt        text,
  body_md        text   NOT NULL,
  cover_media_id bigint REFERENCES media_assets(id) ON DELETE SET NULL,
  status         text   NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','IN_REVIEW','PUBLISHED','ARCHIVED')),
  published_at   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE article_tags (
  article_id bigint NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id     bigint NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE article_comments (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  article_id bigint NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author_id  bigint REFERENCES users(id) ON DELETE SET NULL,
  body_md    text   NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE feed_sources (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name            text    NOT NULL,
  feed_url        text    NOT NULL UNIQUE,
  active          boolean NOT NULL DEFAULT true,
  etag            text,
  last_modified   text,
  last_fetched_at timestamptz
);

CREATE TABLE feed_items (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_id    bigint NOT NULL REFERENCES feed_sources(id) ON DELETE CASCADE,
  guid         text   NOT NULL,
  title        text   NOT NULL,
  url          text   NOT NULL,
  summary      text,
  published_at timestamptz,
  UNIQUE (source_id, guid)
);

-- ===================== 7. NOTIFICATIONS, MODÉRATION, LABO, AUDIT =====================
CREATE TABLE notifications (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       text   NOT NULL,
  payload    jsonb  NOT NULL,
  read_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_unread_idx ON notifications (user_id, created_at DESC) WHERE read_at IS NULL;

CREATE TABLE reports (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reporter_id bigint REFERENCES users(id) ON DELETE SET NULL,
  target_type text   NOT NULL CHECK (target_type IN ('MESSAGE','POST','ARTICLE_COMMENT','USER')),
  target_id   bigint NOT NULL,
  reason      text   NOT NULL,
  status      text   NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','RESOLVED','DISMISSED')),
  handled_by  bigint REFERENCES users(id) ON DELETE SET NULL,
  handled_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reports_open_idx ON reports (created_at) WHERE status = 'OPEN';

CREATE TABLE lab_activity (                                -- statistiques uniquement : ni clé, ni texte clair
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool       text   NOT NULL CHECK (tool IN ('KEYGEN','CIPHER','HASH','SIGN','VERIFY')),
  algorithm  text   NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id    bigint REFERENCES users(id) ON DELETE SET NULL,
  action      text   NOT NULL,
  target_type text,
  target_id   bigint,
  ip          inet,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ===================== 8. ÉVÉNEMENTS INTER-MODULES (Spring Modulith, schéma v2) =====================
CREATE TABLE event_publication (
  id                     uuid NOT NULL PRIMARY KEY,
  listener_id            text NOT NULL,
  event_type             text NOT NULL,
  serialized_event       text NOT NULL,
  publication_date       timestamptz NOT NULL,
  completion_date        timestamptz,
  status                 text,
  completion_attempts    int,
  last_resubmission_date timestamptz
);
CREATE INDEX event_publication_serialized_event_hash_idx ON event_publication USING hash (serialized_event);
CREATE INDEX event_publication_by_completion_date_idx ON event_publication (completion_date);
