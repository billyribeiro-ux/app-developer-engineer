use rusqlite::Connection;

pub fn create_tables(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch("
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            current_phase INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            phase_number INTEGER NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            consultant_id TEXT,
            is_handoff INTEGER NOT NULL DEFAULT 0,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS artifacts (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            phase_number INTEGER NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            version INTEGER NOT NULL DEFAULT 1,
            is_stale INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS consultant_memories (
            id TEXT PRIMARY KEY,
            consultant_id TEXT NOT NULL,
            project_id TEXT NOT NULL,
            key TEXT NOT NULL,
            value TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
        CREATE INDEX IF NOT EXISTS idx_artifacts_title ON artifacts(title);
        CREATE INDEX IF NOT EXISTS idx_artifacts_project ON artifacts(project_id);
        CREATE INDEX IF NOT EXISTS idx_messages_project_phase ON messages(project_id, phase_number);
    ")?;
    Ok(())
}
