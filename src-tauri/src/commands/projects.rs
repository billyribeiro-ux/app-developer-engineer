use crate::db::DbState;
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub description: String,
    pub current_phase: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateProjectInput {
    pub name: String,
    pub description: String,
}

#[tauri::command]
pub fn create_project(db: State<DbState>, input: CreateProjectInput) -> Result<Project, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO projects (id, name, description, current_phase, created_at, updated_at) VALUES (?1, ?2, ?3, 1, ?4, ?5)",
        rusqlite::params![id, input.name, input.description, now, now],
    ).map_err(|e| e.to_string())?;

    Ok(Project {
        id,
        name: input.name,
        description: input.description,
        current_phase: 1,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn get_projects(db: State<DbState>) -> Result<Vec<Project>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, name, description, current_phase, created_at, updated_at FROM projects ORDER BY updated_at DESC"
    ).map_err(|e| e.to_string())?;

    let projects = stmt.query_map([], |row| {
        Ok(Project {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            current_phase: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(projects)
}

#[tauri::command]
pub fn get_project(db: State<DbState>, id: String) -> Result<Project, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT id, name, description, current_phase, created_at, updated_at FROM projects WHERE id = ?1",
        [&id],
        |row| Ok(Project {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            current_phase: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    ).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_project(
    db: State<DbState>,
    id: String,
    name: Option<String>,
    description: Option<String>,
    current_phase: Option<i32>,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    if let Some(name) = name {
        conn.execute(
            "UPDATE projects SET name = ?1, updated_at = ?2 WHERE id = ?3",
            rusqlite::params![name, now, id],
        ).map_err(|e| e.to_string())?;
    }
    if let Some(description) = description {
        conn.execute(
            "UPDATE projects SET description = ?1, updated_at = ?2 WHERE id = ?3",
            rusqlite::params![description, now, id],
        ).map_err(|e| e.to_string())?;
    }
    if let Some(phase) = current_phase {
        conn.execute(
            "UPDATE projects SET current_phase = ?1, updated_at = ?2 WHERE id = ?3",
            rusqlite::params![phase, now, id],
        ).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn delete_project(db: State<DbState>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM projects WHERE id = ?1", [&id]).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM messages WHERE project_id = ?1", [&id]).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM artifacts WHERE project_id = ?1", [&id]).map_err(|e| e.to_string())?;
    Ok(())
}
