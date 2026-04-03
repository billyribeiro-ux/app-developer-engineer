// Universal search service
// TODO: Implement SQLite FTS5 search via Tauri commands
export async function searchAll(query: string): Promise<SearchResult[]> {
  console.log(`Searching for: ${query}`);
  return [];
}

export interface SearchResult {
  type: 'project' | 'message' | 'artifact';
  id: string;
  title: string;
  preview: string;
  projectId: string;
}
