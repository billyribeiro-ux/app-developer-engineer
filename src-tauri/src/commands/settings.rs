use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn get_api_key(app: AppHandle) -> Result<Option<String>, String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    let key = store
        .get("api_key")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .or_else(|| std::env::var("ANTHROPIC_API_KEY").ok());
    Ok(key)
}

#[tauri::command]
pub fn set_api_key(app: AppHandle, key: String) -> Result<(), String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    store.set("api_key", serde_json::json!(key));
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}
