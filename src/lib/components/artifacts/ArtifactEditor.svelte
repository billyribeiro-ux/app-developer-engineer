<script lang="ts">
  import type { Artifact } from '$lib/types/artifact';
  import { updateExistingArtifact } from '$lib/services/artifact-service';
  import { phaseState } from '$lib/state/phase.svelte';
  import MonacoWrapper from './MonacoWrapper.svelte';
  import MermaidDiagram from './MermaidDiagram.svelte';

  let { artifact }: { artifact: Artifact } = $props();

  // Track which artifact the local edit belongs to so we can reset on switch.
  // Initialise with empty strings; the $effect below sets real values on mount.
  let editingId = $state('');
  let localContent = $state('');

  // When the artifact prop changes (different artifact selected), reset local state.
  $effect(() => {
    const id = artifact.id;
    const base = artifact.content;
    if (id !== editingId) {
      editingId = id;
      localContent = base;
    }
  });

  let saving = $state(false);
  let dirty = $derived(localContent !== artifact.content);

  const isCode = $derived(
    ['source-code', 'test-suite', 'ci-config'].includes(artifact.type)
  );
  const isMermaid = $derived(artifact.type === 'mermaid-diagram');

  function detectLanguage(): string {
    if (artifact.type === 'ci-config') return 'yaml';
    if (artifact.type === 'test-suite') return 'typescript';
    const trimmed = localContent.trimStart();
    if (trimmed.startsWith('```rust') || trimmed.startsWith('fn ') || trimmed.startsWith('use ')) return 'rust';
    if (trimmed.startsWith('```python') || trimmed.startsWith('def ') || trimmed.startsWith('import ')) return 'python';
    if (trimmed.startsWith('```json') || trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
    if (trimmed.startsWith('```yaml') || trimmed.startsWith('---')) return 'yaml';
    return 'typescript';
  }

  async function handleSave() {
    if (!dirty || saving) return;
    saving = true;
    try {
      await updateExistingArtifact(
        artifact.id,
        undefined,
        localContent,
        phaseState.currentPhaseNumber
      );
    } finally {
      saving = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="editor">
  <div class="editor-toolbar">
    <span class="artifact-type">{artifact.type}</span>
    <div class="toolbar-right">
      {#if dirty}
        <span class="dirty-indicator">
          <span class="dirty-dot"></span>
          Modified
        </span>
      {/if}
      <button class="save-btn" onclick={handleSave} disabled={!dirty || saving}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  </div>

  <div class="editor-content">
    {#if isCode}
      <MonacoWrapper
        content={localContent}
        language={detectLanguage()}
        onchange={(val) => { localContent = val; }}
      />
    {:else if isMermaid}
      <div class="mermaid-split">
        <div class="mermaid-pane mermaid-source-pane">
          <div class="pane-label">Source</div>
          <textarea
            class="mermaid-source"
            bind:value={localContent}
            spellcheck={false}
          ></textarea>
        </div>
        <div class="mermaid-divider"></div>
        <div class="mermaid-pane mermaid-preview-pane">
          <div class="pane-label">Preview</div>
          <div class="mermaid-preview-scroll">
            <MermaidDiagram code={localContent} />
          </div>
        </div>
      </div>
    {:else}
      <textarea
        class="doc-editor"
        bind:value={localContent}
        spellcheck={false}
        placeholder="Start writing…"
      ></textarea>
    {/if}
  </div>
</div>

<style>
  /* ── Layout ─────────────────────────────────────────────────────────── */
  .editor {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: var(--bg-primary);
  }

  /* ── Toolbar ─────────────────────────────────────────────────────────── */
  .editor-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-primary);
    flex-shrink: 0;
    gap: 10px;
  }

  .artifact-type {
    font-size: 11px;
    font-family: var(--font-mono);
    font-weight: 500;
    color: var(--text-tertiary);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    padding: 2px 8px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .dirty-indicator {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--warning);
  }

  .dirty-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--warning);
    flex-shrink: 0;
  }

  .save-btn {
    padding: 4px 14px;
    font-size: 12px;
    font-weight: 500;
    background: var(--accent-primary);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background 0.15s ease, opacity 0.15s ease;
    white-space: nowrap;
  }

  .save-btn:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  .save-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* ── Editor content area ─────────────────────────────────────────────── */
  .editor-content {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }

  /* ── Doc / plain textarea ────────────────────────────────────────────── */
  .doc-editor {
    flex: 1;
    resize: none;
    background: var(--bg-primary);
    border: none;
    padding: 20px 24px;
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.7;
    color: var(--text-primary);
    outline: none;
    tab-size: 2;
  }

  .doc-editor::placeholder {
    color: var(--text-tertiary);
  }

  /* ── Mermaid split view ──────────────────────────────────────────────── */
  .mermaid-split {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }

  .mermaid-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .pane-label {
    padding: 6px 14px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-tertiary);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-secondary);
    flex-shrink: 0;
  }

  .mermaid-divider {
    width: 1px;
    background: var(--border-primary);
    flex-shrink: 0;
  }

  .mermaid-source {
    flex: 1;
    resize: none;
    background: var(--bg-primary);
    border: none;
    padding: 16px;
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.6;
    color: var(--text-primary);
    outline: none;
    tab-size: 2;
  }

  .mermaid-preview-pane {
    background: var(--bg-surface);
  }

  .mermaid-preview-scroll {
    flex: 1;
    overflow: auto;
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }
</style>
