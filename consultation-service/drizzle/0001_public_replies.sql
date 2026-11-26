CREATE TABLE replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  receipt TEXT NOT NULL UNIQUE,
  body TEXT NOT NULL,
  bucket TEXT NOT NULL,
  created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX replies_thread ON replies(question_id, id DESC);
--> statement-breakpoint
CREATE INDEX replies_rate ON replies(bucket);
