import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import type { StreamChunk } from '$lib/types/message';

// Project commands
export interface ProjectInput {
  name: string;
  description: string;
}

export interface ProjectRow {
  id: string;
  name: string;
  description: string;
  current_phase: number;
  created_at: string;
  updated_at: string;
}

export async function createProject(input: ProjectInput): Promise<ProjectRow> {
  return invoke('create_project', { input });
}

export async function getProjects(): Promise<ProjectRow[]> {
  return invoke('get_projects');
}

export async function getProject(id: string): Promise<ProjectRow> {
  return invoke('get_project', { id });
}

export async function updateProject(
  id: string,
  name?: string,
  description?: string,
  currentPhase?: number
): Promise<void> {
  return invoke('update_project', {
    id,
    name: name ?? null,
    description: description ?? null,
    currentPhase: currentPhase ?? null
  });
}

export async function deleteProject(id: string): Promise<void> {
  return invoke('delete_project', { id });
}

// Artifact commands
export interface ArtifactInput {
  project_id: string;
  phase_number: number;
  type: string;
  title: string;
  content: string;
}

export interface ArtifactRow {
  id: string;
  project_id: string;
  phase_number: number;
  type: string;
  title: string;
  content: string;
  version: number;
  is_stale: boolean;
  created_at: string;
  updated_at: string;
}

export async function createArtifact(input: ArtifactInput): Promise<ArtifactRow> {
  return invoke('create_artifact', { input });
}

export async function getArtifacts(projectId: string): Promise<ArtifactRow[]> {
  return invoke('get_artifacts', { projectId });
}

export async function updateArtifact(
  id: string,
  title?: string,
  content?: string
): Promise<void> {
  return invoke('update_artifact', {
    id,
    title: title ?? null,
    content: content ?? null
  });
}

export async function deleteArtifact(id: string): Promise<void> {
  return invoke('delete_artifact', { id });
}

// Claude streaming
export interface ClaudeRequestPayload {
  model: string;
  max_tokens: number;
  system: string;
  messages: Array<{ role: string; content: string }>;
}

export async function streamClaude(
  request: ClaudeRequestPayload,
  onChunk: (payload: StreamChunk) => void,
  onDone: (fullText: string) => void,
  onError: (error: string) => void
): Promise<void> {
  const unlisteners: UnlistenFn[] = [];

  const unlistenChunk = await listen<StreamChunk>('claude:chunk', (e) => {
    onChunk(e.payload);
  });
  unlisteners.push(unlistenChunk);

  const unlistenDone = await listen<string>('claude:done', (e) => {
    onDone(e.payload);
    cleanup();
  });
  unlisteners.push(unlistenDone);

  function cleanup() {
    unlisteners.forEach((fn) => fn());
  }

  try {
    await invoke('stream_claude', { request });
  } catch (e) {
    onError(String(e));
    cleanup();
  }
}

// Message commands
export interface MessageInput {
  id: string;
  project_id: string;
  phase_number: number;
  role: string;
  content: string;
  consultant_id: string | null;
  is_handoff: boolean;
  timestamp: string;
}

export interface MessageRow {
  id: string;
  project_id: string;
  phase_number: number;
  role: string;
  content: string;
  consultant_id: string | null;
  is_handoff: boolean;
  timestamp: string;
}

export async function saveMessage(message: MessageInput): Promise<void> {
  return invoke('save_message', { message });
}

export async function getMessages(
  projectId: string,
  phaseNumber: number
): Promise<MessageRow[]> {
  return invoke('get_messages', { projectId, phaseNumber });
}

// Settings
export async function getApiKey(): Promise<string | null> {
  return invoke('get_api_key');
}

export async function setApiKey(key: string): Promise<void> {
  return invoke('set_api_key', { key });
}
