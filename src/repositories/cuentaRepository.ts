import { getDatabase } from "@/db/database";

export interface CuentaRow {
  id: number;
  sitio: string;
  usuario: string;
  clave_cifrada: string;
  iv: string;
  notas: string | null;
  actualizada_en: string;
  remote_id: string | null;
  updated_at: string | null;
  deleted: number;
  pending: number;
}

export async function listCuentas(): Promise<CuentaRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<CuentaRow>(
    "SELECT * FROM cuenta WHERE deleted = 0 ORDER BY actualizada_en DESC"
  );
}

export async function getCuentaById(id: number): Promise<CuentaRow | null> {
  const db = await getDatabase();
  return db.getFirstAsync<CuentaRow>(
    "SELECT * FROM cuenta WHERE id = ? AND deleted = 0",
    [id]
  );
}

export async function insertCuenta(input: {
  sitio: string;
  usuario: string;
  clave_cifrada: string;
  iv: string;
  notas: string | null;
}): Promise<number> {
  const db = await getDatabase();
  const ahora = new Date().toISOString();
  const res = await db.runAsync(
    `INSERT INTO cuenta (sitio, usuario, clave_cifrada, iv, notas, actualizada_en, updated_at, deleted, pending)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1)`,
    [
      input.sitio,
      input.usuario,
      input.clave_cifrada,
      input.iv,
      input.notas,
      ahora,
      ahora,
    ]
  );
  return res.lastInsertRowId;
}

export async function softDeleteCuenta(id: number): Promise<void> {
  const db = await getDatabase();
  const ahora = new Date().toISOString();
  await db.runAsync(
    "UPDATE cuenta SET deleted = 1, pending = 1, updated_at = ? WHERE id = ?",
    [ahora, id]
  );
}
