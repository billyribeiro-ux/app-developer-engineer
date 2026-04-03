pub mod schema;

use std::sync::Mutex;
use rusqlite::Connection;
use tauri::{AppHandle, Manager};

pub struct DbState(pub Mutex<Connection>);

pub fn init_db(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let app_dir = app.path().app_data_dir()?;
    std::fs::create_dir_all(&app_dir)?;
    let db_path = app_dir.join("catalyst.db");
    let conn = Connection::open(db_path)?;
    schema::create_tables(&conn)?;
    app.manage(DbState(Mutex::new(conn)));
    Ok(())
}
