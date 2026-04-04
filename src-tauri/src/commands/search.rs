use crate::db::DbState;
use serde::Serialize;
use tauri::State;

#[derive(Debug, Serialize)]
pub struct SearchResult {
    pub result_type: String,
    pub id: String,
    pub title: String,
    pub preview: String,
    pub project_id: String,
}

#[tauri::command]
pub fn search_all(db: State<DbState>, query: String) -> Result<Vec<SearchResult>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut results = Vec::new();
    let like_query = format!("%{}%", query);

    // Search projects
    {
        let mut stmt = conn.prepare(
            "SELECT id, name, description FROM projects WHERE name LIKE ?1 OR description LIKE ?1 LIMIT 5"
        ).map_err(|e| e.to_string())?;
        let rows = stmt.query_map(rusqlite::params![&like_query], |row| {
            let id: String = row.get(0)?;
            Ok(SearchResult {
                result_type: "project".to_string(),
                id: id.clone(),
                title: row.get(1)?,
                preview: row.get::<_, String>(2).unwrap_or_default(),
                project_id: id,
            })
        }).map_err(|e| e.to_string())?;
        for r in rows {
            results.push(r.map_err(|e| e.to_string())?);
        }
    }

    // Search artifacts
    {
        let mut stmt = conn.prepare(
            "SELECT id, title, content, project_id FROM artifacts WHERE title LIKE ?1 OR content LIKE ?1 LIMIT 10"
        ).map_err(|e| e.to_string())?;
        let rows = stmt.query_map(rusqlite::params![&like_query], |row| {
            let content: String = row.get::<_, String>(2).unwrap_or_default();
            let preview = if content.len() > 100 { content[..100].to_string() } else { content };
            Ok(SearchResult {
                result_type: "artifact".to_string(),
                id: row.get(0)?,
                title: row.get(1)?,
                preview,
                project_id: row.get(3)?,
            })
        }).map_err(|e| e.to_string())?;
        for r in rows {
            results.push(r.map_err(|e| e.to_string())?);
        }
    }

    // Search messages
    {
        let mut stmt = conn.prepare(
            "SELECT id, content, project_id FROM messages WHERE content LIKE ?1 LIMIT 10"
        ).map_err(|e| e.to_string())?;
        let rows = stmt.query_map(rusqlite::params![&like_query], |row| {
            let content: String = row.get::<_, String>(1).unwrap_or_default();
            let preview = if content.len() > 100 { content[..100].to_string() } else { content.clone() };
            let title = if content.len() > 50 {
                format!("{}...", &content[..50])
            } else {
                content
            };
            Ok(SearchResult {
                result_type: "message".to_string(),
                id: row.get(0)?,
                title,
                preview,
                project_id: row.get(2)?,
            })
        }).map_err(|e| e.to_string())?;
        for r in rows {
            results.push(r.map_err(|e| e.to_string())?);
        }
    }

    Ok(results)
}
