<script lang="ts">
  import { uiState } from '$lib/state/ui.svelte';
  import { CONSULTANTS } from '$lib/constants/consultants';
  import { buildHuddlePrompt } from '$lib/prompts/huddle';
  import { streamClaude } from '$lib/services/tauri-commands';
  import { renderMarkdown } from '$lib/utils/markdown';
  import type { PhaseNumber } from '$lib/types/project';

  let { mode = 'indicator' }: { mode?: 'picker' | 'indicator' } = $props();

  // ── Huddle chat state ────────────────────────────────────────────────────────
  interface HuddleMessage {
    id: string;
    consultantId: string;
    role: 'user' | 'assistant';
    content: string;
  }

  let messages = $state<HuddleMessage[]>([]);
  let input = $state('');
  let selectedConsultant = $state<string>('');
  let streaming = $state(false);
  let streamContent = $state('');
  let messagesEl = $state<HTMLDivElement | null>(null);

  // All consultants as an array
  const allConsultants = $derived(Object.values(CONSULTANTS));

  // Consultants active in the current huddle
  const activeConsultants = $derived(
    uiState.huddleConsultantIds
      .map((id) => allConsultants.find((c) => c.id === id))
      .filter((c): c is (typeof allConsultants)[number] => Boolean(c))
  );

  // Whether we should render the chat UI (third mode)
  const huddleChatActive = $derived(
    uiState.huddleActive &&
      uiState.huddleConsultantIds.length >= 2 &&
      mode !== 'picker'
  );

  // Default to first active consultant when huddle starts
  $effect(() => {
    if (activeConsultants.length > 0 && !selectedConsultant) {
      selectedConsultant = activeConsultants[0].id;
    }
  });

  // Auto-scroll messages list to bottom on new message / stream update
  $effect(() => {
    void messages;
    void streamContent;
    if (messagesEl) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  });

  // ── Picker state ─────────────────────────────────────────────────────────────
  let selected = $state<string[]>([]);

  function toggleConsultant(id: string) {
    if (selected.includes(id)) {
      selected = selected.filter((s) => s !== id);
    } else {
      selected = [...selected, id];
    }
  }

  function startHuddle() {
    if (selected.length < 2) return;
    uiState.startHuddle(selected);
  }

  // ── Chat actions ─────────────────────────────────────────────────────────────
  async function sendMessage() {
    if (!input.trim() || streaming) return;

    const userMsg = input.trim();
    input = '';

    messages = [
      ...messages,
      {
        id: crypto.randomUUID(),
        consultantId: '',
        role: 'user',
        content: userMsg
      }
    ];

    const consultant = allConsultants.find((c) => c.id === selectedConsultant);
    if (!consultant) return;

    const otherPhases = activeConsultants
      .filter((c) => c.id !== consultant.id)
      .map((c) => c.phaseNumber as PhaseNumber);

    const systemPrompt = buildHuddlePrompt(consultant.phaseNumber as PhaseNumber, otherPhases);

    // Build message history; prefix assistant turns with the speaker's name
    const history = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content:
        m.role === 'assistant'
          ? `[${allConsultants.find((c) => c.id === m.consultantId)?.name ?? 'Unknown'}]: ${m.content}`
          : m.content
    }));

    streaming = true;
    streamContent = '';

    await streamClaude(
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: history
      },
      (chunk) => {
        streamContent += chunk.delta;
      },
      (fullText) => {
        messages = [
          ...messages,
          {
            id: crypto.randomUUID(),
            consultantId: consultant.id,
            role: 'assistant',
            content: fullText
          }
        ];
        streaming = false;
        streamContent = '';
      },
      (err) => {
        streaming = false;
        console.error('Huddle stream error:', err);
      }
    );
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function endHuddle() {
    uiState.endHuddle();
    messages = [];
    input = '';
    selectedConsultant = '';
    selected = [];
  }

  // Lookup accent colour for a consultant id (used in template)
  function accentFor(consultantId: string): string {
    return allConsultants.find((c) => c.id === consultantId)?.accentColor ?? 'var(--accent-primary)';
  }

  function nameFor(consultantId: string): string {
    return allConsultants.find((c) => c.id === consultantId)?.name ?? 'Unknown';
  }
</script>

<!-- ══ PICKER MODE ══════════════════════════════════════════════════════════ -->
{#if mode === 'picker'}
  <div
    class="huddle-picker-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Team Huddle"
    tabindex="-1"
    onclick={() => uiState.endHuddle()}
    onkeydown={(e) => { if (e.key === 'Escape') uiState.endHuddle(); }}
  >
    <div class="huddle-picker" role="presentation" onclick={(e) => e.stopPropagation()}>
      <h3>Start a Team Huddle</h3>
      <p class="picker-hint">Select 2+ consultants for a multi-perspective discussion</p>

      <div class="consultant-grid">
        {#each allConsultants as c (c.id)}
          <button
            class="consultant-option"
            class:selected={selected.includes(c.id)}
            style:--accent={c.accentColor}
            onclick={() => toggleConsultant(c.id)}
          >
            <div class="option-avatar">{c.name.charAt(0)}</div>
            <div class="option-info">
              <span class="option-name">{c.name}</span>
              <span class="option-title">{c.title}</span>
            </div>
            {#if selected.includes(c.id)}
              <span class="option-check">✓</span>
            {/if}
          </button>
        {/each}
      </div>

      <div class="picker-actions">
        <button class="cancel-btn" onclick={() => uiState.endHuddle()}>Cancel</button>
        <button class="start-btn" onclick={startHuddle} disabled={selected.length < 2}>
          Start Huddle ({selected.length} selected)
        </button>
      </div>
    </div>
  </div>

<!-- ══ HUDDLE CHAT MODE ════════════════════════════════════════════════════ -->
{:else if huddleChatActive}
  <div class="huddle-chat">
    <!-- Header -->
    <div class="chat-header">
      <div class="chat-header-left">
        <span class="huddle-badge">HUDDLE</span>
        <div class="header-avatars">
          {#each activeConsultants as c (c.id)}
            <div
              class="mini-avatar"
              style:--accent={c.accentColor}
              title={c.name}
            >{c.name.charAt(0)}</div>
          {/each}
        </div>
        <span class="chat-header-label">{activeConsultants.length} consultants active</span>
      </div>
      <button class="end-btn" onclick={endHuddle}>End Huddle</button>
    </div>

    <!-- Consultant selector -->
    <div class="consultant-selector">
      <span class="selector-label">Addressing:</span>
      {#each activeConsultants as c (c.id)}
        <button
          class="selector-btn"
          class:active={selectedConsultant === c.id}
          style:--accent={c.accentColor}
          onclick={() => { selectedConsultant = c.id; }}
          title={c.title}
        >
          <span class="selector-avatar">{c.name.charAt(0)}</span>
          <span class="selector-name">{c.name.split(' ')[0]}</span>
        </button>
      {/each}
    </div>

    <!-- Message list -->
    <div class="messages" bind:this={messagesEl}>
      {#if messages.length === 0}
        <div class="empty-state">
          <p>Your huddle is ready. Ask a question to get multiple expert perspectives.</p>
        </div>
      {/if}

      {#each messages as msg (msg.id)}
        {#if msg.role === 'user'}
          <div class="message user-message">
            <div class="message-bubble user-bubble">
              {@html renderMarkdown(msg.content)}
            </div>
          </div>
        {:else}
          <div
            class="message assistant-message"
            style:--consultant-accent={accentFor(msg.consultantId)}
          >
            <div class="consultant-label">
              <span
                class="inline-avatar"
                style:background={accentFor(msg.consultantId)}
              >{nameFor(msg.consultantId).charAt(0)}</span>
              <span class="consultant-name" style:color={accentFor(msg.consultantId)}>
                {nameFor(msg.consultantId)}
              </span>
            </div>
            <div class="message-bubble assistant-bubble">
              {@html renderMarkdown(msg.content)}
            </div>
          </div>
        {/if}
      {/each}

      <!-- Streaming indicator -->
      {#if streaming}
        {@const streamingConsultant = allConsultants.find((c) => c.id === selectedConsultant)}
        <div
          class="message assistant-message"
          style:--consultant-accent={streamingConsultant?.accentColor ?? 'var(--accent-primary)'}
        >
          <div class="consultant-label">
            <span
              class="inline-avatar"
              style:background={streamingConsultant?.accentColor ?? 'var(--accent-primary)'}
            >{streamingConsultant?.name.charAt(0) ?? '?'}</span>
            <span
              class="consultant-name"
              style:color={streamingConsultant?.accentColor ?? 'var(--accent-primary)'}
            >{streamingConsultant?.name ?? 'Consultant'}</span>
          </div>
          <div class="message-bubble assistant-bubble">
            {#if streamContent}
              {@html renderMarkdown(streamContent)}
            {:else}
              <span class="typing-indicator">
                <span></span><span></span><span></span>
              </span>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- Input area -->
    <div class="chat-input-area">
      <textarea
        class="chat-input"
        placeholder="Ask the huddle a question… (Enter to send, Shift+Enter for new line)"
        rows={2}
        bind:value={input}
        disabled={streaming}
        onkeydown={handleKeydown}
      ></textarea>
      <button
        class="send-btn"
        onclick={sendMessage}
        disabled={streaming || !input.trim()}
        aria-label="Send message"
      >
        {#if streaming}
          <span class="send-spinner"></span>
        {:else}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        {/if}
      </button>
    </div>
  </div>

<!-- ══ INDICATOR MODE ═══════════════════════════════════════════════════════ -->
{:else}
  <div class="huddle-indicator">
    <div class="huddle-left">
      <span class="huddle-badge">HUDDLE</span>
      <div class="huddle-avatars">
        {#each activeConsultants as c (c.id)}
          <div class="mini-avatar" style:--accent={c.accentColor} title={c.name}>
            {c.name.charAt(0)}
          </div>
        {/each}
      </div>
      <span class="huddle-label">{activeConsultants.length} consultants active</span>
    </div>
    <button class="end-btn" onclick={() => uiState.endHuddle()}>End Huddle</button>
  </div>
{/if}

<style>
  /* ── Shared ──────────────────────────────────────────────────────────────── */
  .huddle-badge {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--accent-primary);
    color: white;
    flex-shrink: 0;
  }

  .mini-avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent);
    color: white;
    border: 2px solid var(--bg-surface);
    margin-left: -4px;
    flex-shrink: 0;
  }
  .mini-avatar:first-child { margin-left: 0; }

  .end-btn {
    font-size: 11px;
    padding: 3px 10px;
    border-radius: var(--radius-sm);
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-primary);
    cursor: pointer;
    transition: background var(--transition-fast), color var(--transition-fast);
  }
  .end-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  /* ── Picker overlay ───────────────────────────────────────────────────────── */
  .huddle-picker-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    backdrop-filter: blur(4px);
  }

  .huddle-picker {
    background: var(--bg-surface);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    padding: 28px;
    max-width: 520px;
    width: 100%;
    box-shadow: var(--shadow-lg);
  }
  .huddle-picker h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 4px;
    color: var(--text-primary);
  }
  .picker-hint {
    font-size: 13px;
    color: var(--text-tertiary);
    margin-bottom: 20px;
  }

  .consultant-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 20px;
  }

  .consultant-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-primary);
    background: var(--bg-primary);
    text-align: left;
    cursor: pointer;
    transition: all var(--transition-fast);
    width: 100%;
  }
  .consultant-option:hover {
    border-color: var(--accent);
    background: var(--bg-hover);
  }
  .consultant-option.selected {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 10%, var(--bg-surface));
  }

  .option-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent);
    color: white;
    font-size: 14px;
    font-weight: 700;
  }
  .option-info {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .option-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
  }
  .option-title {
    font-size: 11px;
    color: var(--text-tertiary);
  }
  .option-check {
    font-size: 14px;
    font-weight: 700;
    color: var(--accent);
    margin-left: auto;
  }

  .picker-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  .cancel-btn {
    padding: 8px 16px;
    font-size: 13px;
    border-radius: var(--radius-md);
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-primary);
    cursor: pointer;
  }
  .cancel-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

  .start-btn {
    padding: 8px 16px;
    font-size: 13px;
    border-radius: var(--radius-md);
    background: var(--accent-primary);
    color: white;
    font-weight: 500;
    border: none;
    cursor: pointer;
  }
  .start-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .start-btn:not(:disabled):hover { filter: brightness(1.1); }

  /* ── Indicator bar ────────────────────────────────────────────────────────── */
  .huddle-indicator {
    padding: 6px 16px;
    background: color-mix(in srgb, var(--accent-primary) 8%, var(--bg-surface));
    border-bottom: 1px solid color-mix(in srgb, var(--accent-primary) 20%, var(--border-primary));
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .huddle-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .huddle-avatars { display: flex; }
  .huddle-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  /* ── Huddle Chat ──────────────────────────────────────────────────────────── */
  .huddle-chat {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-primary);
    overflow: hidden;
  }

  /* Header */
  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: color-mix(in srgb, var(--accent-primary) 8%, var(--bg-surface));
    border-bottom: 1px solid color-mix(in srgb, var(--accent-primary) 20%, var(--border-primary));
    flex-shrink: 0;
  }
  .chat-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .header-avatars { display: flex; }
  .chat-header-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  /* Consultant selector */
  .consultant-selector {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border-primary);
    flex-shrink: 0;
    flex-wrap: wrap;
  }
  .selector-label {
    font-size: 11px;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-right: 2px;
  }
  .selector-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 20px;
    border: 1px solid var(--border-primary);
    background: var(--bg-primary);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 12px;
  }
  .selector-btn:hover {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 8%, var(--bg-surface));
  }
  .selector-btn.active {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 15%, var(--bg-surface));
    box-shadow: 0 0 0 1px var(--accent);
  }
  .selector-avatar {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .selector-name {
    color: var(--text-primary);
    font-weight: 500;
  }

  /* Messages */
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scroll-behavior: smooth;
  }

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 24px;
  }
  .empty-state p {
    font-size: 13px;
    color: var(--text-tertiary);
    max-width: 280px;
    line-height: 1.5;
  }

  .message { display: flex; flex-direction: column; }

  .user-message { align-items: flex-end; }

  .user-bubble {
    background: var(--accent-primary);
    color: white;
    border-radius: var(--radius-md) var(--radius-md) 2px var(--radius-md);
    padding: 10px 14px;
    max-width: 75%;
    font-size: 13px;
    line-height: 1.5;
  }

  .assistant-message { align-items: flex-start; }

  .consultant-label {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }
  .inline-avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 10px;
    font-weight: 700;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .consultant-name {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .assistant-bubble {
    background: var(--bg-surface);
    border: 1px solid var(--border-primary);
    border-left: 3px solid var(--consultant-accent, var(--accent-primary));
    border-radius: 2px var(--radius-md) var(--radius-md) var(--radius-md);
    padding: 10px 14px;
    max-width: 85%;
    font-size: 13px;
    line-height: 1.6;
    color: var(--text-primary);
  }

  /* Markdown content inside bubbles */
  .assistant-bubble :global(p) { margin: 0 0 8px; }
  .assistant-bubble :global(p:last-child) { margin-bottom: 0; }
  .assistant-bubble :global(ul),
  .assistant-bubble :global(ol) { margin: 6px 0 8px 16px; }
  .assistant-bubble :global(li) { margin-bottom: 2px; }
  .assistant-bubble :global(code) {
    background: var(--bg-tertiary);
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 12px;
    font-family: var(--font-mono, monospace);
  }
  .assistant-bubble :global(pre) { margin: 8px 0; }
  .assistant-bubble :global(strong) { font-weight: 600; }
  .user-bubble :global(p) { margin: 0; }

  /* Typing indicator */
  .typing-indicator {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 4px 0;
  }
  .typing-indicator span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-tertiary);
    animation: bounce 1.2s ease-in-out infinite;
  }
  .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
  .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-5px); opacity: 1; }
  }

  /* Input area */
  .chat-input-area {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 12px 16px;
    background: var(--bg-surface);
    border-top: 1px solid var(--border-primary);
    flex-shrink: 0;
  }

  .chat-input {
    flex: 1;
    resize: none;
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    padding: 8px 12px;
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.5;
    font-family: inherit;
    transition: border-color var(--transition-fast);
  }
  .chat-input:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
  .chat-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .chat-input::placeholder { color: var(--text-tertiary); }

  .send-btn {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: var(--accent-primary);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: filter var(--transition-fast);
  }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .send-btn:not(:disabled):hover { filter: brightness(1.1); }

  /* Spinner inside send button while streaming */
  .send-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
