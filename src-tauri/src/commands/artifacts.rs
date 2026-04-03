use crate::db::DbState;
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Serialize, Deserialize)]
pub struct Artifact {
    pub id: String,
    pub project_id: String,
    pub phase_number: i32,
    #[serde(rename = "type")]
    pub artifact_type: String,
    pub title: String,
    pub content: String,
    pub version: i32,
    pub is_stale: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateArtifactInput {
    pub project_id: String,
    pub phase_number: i32,
    #[serde(rename = "type")]
    pub artifact_type: String,
    pub title: String,
    pub content: String,
}

#[tauri::command]
pub fn create_artifact(db: State<DbState>, input: CreateArtifactInput) -> Result<Artifact, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO artifacts (id, project_id, phase_number, type, title, content, version, is_stale, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 1, 0, ?7, ?8)",
        rusqlite::params![
            id,
            input.project_id,
            input.phase_number,
            input.artifact_type,
            input.title,
            input.content,
            now,
            now
        ],
    ).map_err(|e| e.to_string())?;

    Ok(Artifact {
        id,
        project_id: input.project_id,
        phase_number: input.phase_number,
        artifact_type: input.artifact_type,
        title: input.title,
        content: input.content,
        version: 1,
        is_stale: false,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn get_artifacts(db: State<DbState>, project_id: String) -> Result<Vec<Artifact>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, project_id, phase_number, type, title, content, version, is_stale, created_at, updated_at FROM artifacts WHERE project_id = ?1 ORDER BY phase_number ASC, created_at ASC"
    ).map_err(|e| e.to_string())?;

    let artifacts = stmt.query_map(rusqlite::params![project_id], |row| {
        Ok(Artifact {
            id: row.get(0)?,
            project_id: row.get(1)?,
            phase_number: row.get(2)?,
            artifact_type: row.get(3)?,
            title: row.get(4)?,
            content: row.get(5)?,
            version: row.get(6)?,
            is_stale: row.get::<_, i32>(7)? != 0,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(artifacts)
}

#[tauri::command]
pub fn update_artifact(
    db: State<DbState>,
    id: String,
    title: Option<String>,
    content: Option<String>,
    is_stale: Option<bool>,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    if let Some(title) = title {
        conn.execute(
            "UPDATE artifacts SET title = ?1, updated_at = ?2 WHERE id = ?3",
            rusqlite::params![title, now, id],
        ).map_err(|e| e.to_string())?;
    }
    if let Some(content) = content {
        conn.execute(
            "UPDATE artifacts SET content = ?1, version = version + 1, updated_at = ?2 WHERE id = ?3",
            rusqlite::params![content, now, id],
        ).map_err(|e| e.to_string())?;
    }
    if let Some(stale) = is_stale {
        conn.execute(
            "UPDATE artifacts SET is_stale = ?1, updated_at = ?2 WHERE id = ?3",
            rusqlite::params![stale as i32, now, id],
        ).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn delete_artifact(db: State<DbState>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM artifacts WHERE id = ?1", [&id]).map_err(|e| e.to_string())?;
    Ok(())
}
