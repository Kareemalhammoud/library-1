-- LAU Library full schema.
-- `users` and `loans` are inferred from the SQL already used by the auth
-- and dashboard controllers. `books` and `events` are owned by this branch
-- (Kareem Hammoud). Run against an empty MySQL database:
--   mysql -u <user> -p <database> < server/db/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  full_name    VARCHAR(120) NOT NULL,
  email        VARCHAR(190) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  author           VARCHAR(255) NOT NULL,
  genre            VARCHAR(80),
  language         VARCHAR(4),
  year             INT,
  rating           DECIMAL(3,2),
  pages            INT,
  publisher        VARCHAR(255),
  isbn             VARCHAR(32),
  description      MEDIUMTEXT,
  cover            VARCHAR(500),
  color            VARCHAR(30),
  genre_color      VARCHAR(16),
  badge            VARCHAR(60),
  available_copies INT NOT NULL DEFAULT 3,
  created_by       INT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_books_genre (genre),
  INDEX idx_books_language (language),
  CONSTRAINT fk_books_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS events (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  date             DATE NOT NULL,
  time             VARCHAR(80),
  location         VARCHAR(255),
  category         VARCHAR(80),
  format           VARCHAR(40),
  featured         TINYINT(1) DEFAULT 0,
  image            VARCHAR(500),
  description      TEXT,
  long_description TEXT,
  speaker          VARCHAR(255),
  seats            INT,
  registered       INT,
  audience         TEXT,
  takeaway         TEXT,
  highlights       JSON,
  created_by       INT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_events_category (category),
  INDEX idx_events_date (date),
  CONSTRAINT fk_events_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  book_id        INT NOT NULL,
  user_id        INT,
  reviewer_name  VARCHAR(120),
  rating         TINYINT NOT NULL,
  comment        TEXT,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reviews_book (book_id),
  CONSTRAINT fk_reviews_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id      INT NOT NULL,
  book_id      INT NOT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, book_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS loans (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  book_id      INT NOT NULL,
  borrow_date  DATE NOT NULL,
  due_date     DATE NOT NULL,
  return_date  DATE,
  renew_count  INT DEFAULT 0,
  status       VARCHAR(40) DEFAULT 'active',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_loans_user (user_id),
  CONSTRAINT fk_loans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_loans_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
