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
  total_copies     INT NOT NULL DEFAULT 3,
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

CREATE TABLE IF NOT EXISTS event_registrations (
  user_id       INT NOT NULL,
  event_id      INT NOT NULL,
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, event_id),
  INDEX idx_event_registrations_event (event_id),
  CONSTRAINT fk_event_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_event_registrations_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
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

CREATE TABLE IF NOT EXISTS reservations (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  book_id      INT NOT NULL,
  reserved_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  fulfilled_at DATETIME,
  status       VARCHAR(40) DEFAULT 'active',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reservations_user (user_id),
  INDEX idx_reservations_book (book_id),
  CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reservations_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reading_progress (
  user_id      INT NOT NULL,
  book_id      INT NOT NULL,
  progress     TINYINT NOT NULL DEFAULT 0,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, book_id),
  CONSTRAINT fk_reading_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reading_progress_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  CONSTRAINT chk_reading_progress_value CHECK (progress BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS study_room_bookings (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  campus         VARCHAR(40) NOT NULL,
  room           VARCHAR(80) NOT NULL,
  booking_date   DATE NOT NULL,
  start_time     VARCHAR(40) NOT NULL,
  duration       VARCHAR(40) NOT NULL,
  people         INT NOT NULL,
  student_id     VARCHAR(80) NOT NULL,
  requested_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  status         VARCHAR(40) DEFAULT 'confirmed',
  notes          TEXT,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_study_room_bookings_slot (room, booking_date, start_time),
  INDEX idx_study_room_bookings_student (student_id),
  UNIQUE KEY uniq_study_room_booking_status (room, booking_date, start_time, status),
  CONSTRAINT chk_study_room_people CHECK (people BETWEEN 1 AND 20)
);

CREATE TABLE IF NOT EXISTS help_requests (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(120),
  email          VARCHAR(190),
  message        TEXT NOT NULL,
  requested_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  status         VARCHAR(40) DEFAULT 'open',
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_help_requests_status (status),
  INDEX idx_help_requests_created (created_at)
);
