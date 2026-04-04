use crate::db::DbState;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct MemoryRow {
    pub id: String,
    pub consultant_id: String,
    pub project_id: String,
    pub key: String,
    pub value: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct MemoryInput {
    pub consultant_id: String,
    pub project_id: String,
    pub key: String,
    pub value: String,
}

#[tauri::command]
pub fn save_memory(db: State<DbState>, input: MemoryInput) -> Result<MemoryRow, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO consultant_memories (id, consultant_id, project_id, key, value, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![id, input.consultant_id, input.project_id, input.key, input.value, now],
    ).map_err(|e| e.to_string())?;

    Ok(MemoryRow {
        id,
        consultant_id: input.consultant_id,
        project_id: input.project_id,
        key: input.key,
        value: input.value,
        created_at: now,
    })
}

#[tauri::command]
pub fn get_memories(
    db: State<DbState>,
    consultant_id: String,
    project_id: String,
) -> Result<Vec<MemoryRow>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, consultant_id, project_id, key, value, created_at FROM consultant_memories WHERE consultant_id = ?1 AND project_id = ?2 ORDER BY created_at ASC"
    ).map_err(|e| e.to_string())?;

    let memories = stmt.query_map(rusqlite::params![consultant_id, project_id], |row| {
        Ok(MemoryRow {
            id: row.get(0)?,
            consultant_id: row.get(1)?,
            project_id: row.get(2)?,
            key: row.get(3)?,
            value: row.get(4)?,
            created_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(memories)
}

#[tauri::command]
pub fn delete_memory(db: State<DbState>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM consultant_memories WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
