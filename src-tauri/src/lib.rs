mod commands;
mod db;
mod claude;

use commands::{projects, artifacts, claude as claude_cmd, settings, memories, search};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            db::init_db(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            projects::create_project,
            projects::get_projects,
            projects::get_project,
            projects::update_project,
            projects::delete_project,
            artifacts::create_artifact,
            artifacts::get_artifacts,
            artifacts::update_artifact,
            artifacts::delete_artifact,
            claude_cmd::stream_claude,
            claude_cmd::save_message,
            claude_cmd::get_messages,
            settings::get_api_key,
            settings::set_api_key,
            memories::save_memory,
            memories::get_memories,
            memories::delete_memory,
            search::search_all,
        ])
        .run(tauri::generate_context!())
        .expect("error while running CATALYST");
}
