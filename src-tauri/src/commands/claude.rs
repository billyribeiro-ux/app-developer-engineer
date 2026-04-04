use crate::db::DbState;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, State};
use tauri_plugin_store::StoreExt;
use futures_util::StreamExt;

#[derive(Debug, Deserialize)]
pub struct ClaudeRequest {
    pub model: String,
    pub max_tokens: u32,
    pub system: String,
    pub messages: Vec<ClaudeMessage>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClaudeMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct StreamChunkPayload {
    pub delta: String,
    pub accumulated: String,
}

#[tauri::command]
pub async fn stream_claude(app: AppHandle, request: ClaudeRequest) -> Result<(), String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    let api_key = store
        .get("api_key")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .or_else(|| std::env::var("ANTHROPIC_API_KEY").ok())
        .ok_or_else(|| "No API key configured. Set it in Settings or as ANTHROPIC_API_KEY env var.".to_string())?;

    let client = reqwest::Client::new();

    let body = serde_json::json!({
        "model": request.model,
        "max_tokens": request.max_tokens,
        "system": request.system,
        "messages": request.messages,
        "stream": true
    });

    let response = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", &api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .body(body.to_string())
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(format!("Claude API error {}: {}", status, text));
    }

    let mut stream = response.bytes_stream();
    let mut accumulated = String::new();
    let mut buffer = String::new();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Stream error: {}", e))?;
        let text = String::from_utf8_lossy(&chunk);
        buffer.push_str(&text);

        while let Some(line_end) = buffer.find('\n') {
            let line = buffer[..line_end].trim().to_string();
            buffer = buffer[line_end + 1..].to_string();

            if line.starts_with("data: ") {
                let data = &line[6..];
                if data == "[DONE]" {
                    continue;
                }
                if let Ok(event) = serde_json::from_str::<serde_json::Value>(data) {
                    if event["type"] == "content_block_delta" {
                        if let Some(delta_text) = event["delta"]["text"].as_str() {
                            accumulated.push_str(delta_text);
                            let _ = app.emit("claude:chunk", StreamChunkPayload {
                                delta: delta_text.to_string(),
                                accumulated: accumulated.clone(),
                            });
                        }
                    }
                }
            }
        }
    }

    let _ = app.emit("claude:done", accumulated);
    Ok(())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MessageRow {
    pub id: String,
    pub project_id: String,
    pub phase_number: i32,
    pub role: String,
    pub content: String,
    pub consultant_id: Option<String>,
    pub is_handoff: bool,
    pub timestamp: String,
}

#[tauri::command]
pub fn save_message(db: State<DbState>, message: MessageRow) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO messages (id, project_id, phase_number, role, content, consultant_id, is_handoff, timestamp) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![
            message.id,
            message.project_id,
            message.phase_number,
            message.role,
            message.content,
            message.consultant_id,
            message.is_handoff as i32,
            message.timestamp,
        ],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_messages(
    db: State<DbState>,
    project_id: String,
    phase_number: i32,
) -> Result<Vec<MessageRow>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, project_id, phase_number, role, content, consultant_id, is_handoff, timestamp FROM messages WHERE project_id = ?1 AND phase_number = ?2 ORDER BY timestamp ASC"
    ).map_err(|e| e.to_string())?;

    let messages = stmt.query_map(rusqlite::params![project_id, phase_number], |row| {
        Ok(MessageRow {
            id: row.get(0)?,
            project_id: row.get(1)?,
            phase_number: row.get(2)?,
            role: row.get(3)?,
            content: row.get(4)?,
            consultant_id: row.get(5)?,
            is_handoff: row.get::<_, i32>(6)? != 0,
            timestamp: row.get(7)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(messages)
}
