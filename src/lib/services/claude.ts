import { streamClaude, saveMessage, getMessages, type ClaudeRequestPayload, type MessageRow } from './tauri-commands';
import { toastState } from '$lib/state/toast.svelte';
import { buildSystemPrompt, buildMessages } from '$lib/prompts/context-builder';
import { chatState } from '$lib/state/chat.svelte';
import { artifactState } from '$lib/state/artifact.svelte';
import { consultantMemoryState } from '$lib/state/consultant-memory.svelte';
import { CONSULTANTS } from '$lib/constants/consultants';
import type { PhaseNumber } from '$lib/types/project';
import type { Message } from '$lib/types/message';

export async function sendMessage(
  projectId: string,
  phaseNumber: PhaseNumber,
  userContent: string,
  consultantId?: string
): Promise<void> {
  const consultant = CONSULTANTS[phaseNumber];
  const now = new Date().toISOString();
  const userMessageId = crypto.randomUUID();

  // Add user message optimistically
  const userMessage: Message = {
    id: userMessageId,
    projectId,
    phaseNumber,
    role: 'user',
    content: userContent,
    timestamp: now
  };
  chatState.addMessage(userMessage);

  // Save user message to DB
  await saveMessage({
    id: userMessageId,
    project_id: projectId,
    phase_number: phaseNumber,
    role: 'user',
    content: userContent,
    consultant_id: consultantId ?? null,
    is_handoff: false,
    timestamp: now
  });

  // Build context
  const memories = consultantMemoryState.formatForPrompt(consultant.id);
  const systemPrompt = buildSystemPrompt(phaseNumber, artifactState.artifacts, memories);
  const history = buildMessages(chatState.messages);

  const request: ClaudeRequestPayload = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    messages: history
  };

  // Start streaming
  chatState.startStreaming();

  await streamClaude(
    request,
    (chunk) => {
      chatState.appendChunk(chunk.delta);
    },
    async (fullText) => {
      chatState.finishStreaming();

      // Save assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        projectId,
        phaseNumber,
        role: 'assistant',
        content: fullText,
        consultantId: consultant.id,
        timestamp: new Date().toISOString()
      };
      chatState.addMessage(assistantMessage);

      await saveMessage({
        id: assistantMessage.id,
        project_id: projectId,
        phase_number: phaseNumber,
        role: 'assistant',
        content: fullText,
        consultant_id: consultant.id,
        is_handoff: false,
        timestamp: assistantMessage.timestamp
      });
    },
    (error) => {
      chatState.finishStreaming();
      console.error('Claude streaming error:', error);
      toastState.error(String(error));
    }
  );
}

export async function loadMessages(
  projectId: string,
  phaseNumber: PhaseNumber
): Promise<void> {
  const rows = await getMessages(projectId, phaseNumber);
  const messages: Message[] = rows.map((r: MessageRow) => ({
    id: r.id,
    projectId: r.project_id,
    phaseNumber: r.phase_number as PhaseNumber,
    role: r.role as 'user' | 'assistant',
    content: r.content,
    consultantId: r.consultant_id ?? undefined,
    isHandoff: r.is_handoff,
    timestamp: r.timestamp
  }));
  chatState.setMessages(messages);
}
