import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";
import { open, type Database } from "sqlite";

dotenv.config();

type ExecuteResult = {
  insertId: number;
  affectedRows: number;
  changes: number;
};

type ExecuteResponse = [any, any];

class SQLiteConnection {
  constructor(private readonly db: Database<sqlite3.Database, sqlite3.Statement>) {}

  async execute(sql: string, params: any[] = []): Promise<ExecuteResponse> {
    const normalizedSql = sql.trim().toLowerCase();

    if (
      normalizedSql.startsWith("select") ||
      normalizedSql.startsWith("with") ||
      normalizedSql.startsWith("pragma")
    ) {
      const rows = await this.db.all(sql, params);
      return [rows, undefined];
    }

    const result = await this.db.run(sql, params);
    const payload: ExecuteResult = {
      insertId: result.lastID ?? 0,
      affectedRows: result.changes ?? 0,
      changes: result.changes ?? 0,
    };

    return [payload, undefined];
  }

  async beginTransaction(): Promise<void> {
    await this.db.exec("BEGIN IMMEDIATE TRANSACTION");
  }

  async commit(): Promise<void> {
    await this.db.exec("COMMIT");
  }

  async rollback(): Promise<void> {
    await this.db.exec("ROLLBACK");
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultSqlitePath = path.join(__dirname, "..", "data", "learning_online.sqlite");

const sqliteSchema = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  balance REAL NOT NULL DEFAULT 0,
  avatar TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  title TEXT,
  description TEXT,
  detail_description TEXT,
  price REAL NOT NULL DEFAULT 0,
  teacher_id INTEGER,
  category_id INTEGER,
  image TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT,
  lesson_order INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  question_type TEXT DEFAULT 'single_choice',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS question_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_correct INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  quiz_id INTEGER NOT NULL,
  score REAL NOT NULL,
  taken_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  enrolled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  completion_percentage REAL NOT NULL DEFAULT 0,
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
`;

let connectionPromise: Promise<SQLiteConnection> | null = null;

async function connectDB(): Promise<SQLiteConnection> {
  if (!connectionPromise) {
    connectionPromise = (async () => {
      const dbFilePath = process.env.SQLITE_DB_PATH || process.env.DB_FILE || defaultSqlitePath;
      await fs.mkdir(path.dirname(dbFilePath), { recursive: true });

      const db = await open({
        filename: dbFilePath,
        driver: sqlite3.Database,
      });

      await db.exec(sqliteSchema);
      console.log(`SQLite connected successfully: ${dbFilePath}`);

      return new SQLiteConnection(db);
    })();
  }

  return connectionPromise;
}

export default connectDB;