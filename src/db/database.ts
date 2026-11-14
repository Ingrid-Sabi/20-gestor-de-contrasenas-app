import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  const db = await SQLite.openDatabaseAsync("boveda.db");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cuenta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sitio TEXT NOT NULL,
      usuario TEXT NOT NULL,
      clave_cifrada TEXT NOT NULL,
      iv TEXT NOT NULL,
      notas TEXT,
      actualizada_en TEXT NOT NULL,
      remote_id TEXT,
      updated_at TEXT,
      deleted INTEGER DEFAULT 0,
      pending INTEGER DEFAULT 0
    );
  `);
  dbInstance = db;
  return db;
}
