import type { PhaseNumber } from './project';

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  projectId: string;
  phaseNumber: PhaseNumber;
  role: MessageRole;
  content: string;
  consultantId?: string;
  isHandoff?: boolean;
  timestamp: string;
}

export interface StreamChunk {
  delta: string;
  accumulated: string;
}
