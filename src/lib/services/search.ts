import { invoke } from '@tauri-apps/api/core';

export interface SearchResult {
  type: 'project' | 'message' | 'artifact';
  id: string;
  title: string;
  preview: string;
  projectId: string;
}

interface RawSearchResult {
  result_type: string;
  id: string;
  title: string;
  preview: string;
  project_id: string;
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  try {
    const raw: RawSearchResult[] = await invoke('search_all', { query: query.trim() });
    return raw.map((r) => ({
      type: r.result_type as SearchResult['type'],
      id: r.id,
      title: r.title,
      preview: r.preview,
      projectId: r.project_id
    }));
  } catch (e) {
    console.error('Search failed:', e);
    return [];
  }
}
