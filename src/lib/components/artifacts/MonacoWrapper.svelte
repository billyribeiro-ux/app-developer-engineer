<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let { content = '', language = 'typescript', onchange }: {
    content?: string; language?: string; onchange?: (value: string) => void;
  } = $props();

  let container = $state<HTMLDivElement>();
  let editor: any;
  let loadError = $state(false);

  onMount(async () => {
    try {
      // Monaco is optional - dynamically import without type checking
      const monaco = await import('monaco-editor').catch(() => null);
      if (!monaco || !container) {
        loadError = true;
        return;
      }
      editor = monaco.editor.create(container, {
        value: content,
        language,
        theme: 'vs-dark',
        minimap: { enabled: true },
        fontSize: 13,
        fontFamily: 'var(--font-mono)',
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 12 }
      });
      editor.onDidChangeModelContent(() => {
        onchange?.(editor.getValue());
      });
    } catch (e) {
      console.warn('Monaco editor not available, using fallback:', e);
      loadError = true;
    }
  });

  onDestroy(() => {
    editor?.dispose();
  });

  function handleTextareaChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    onchange?.(target.value);
  }
</script>

{#if loadError}
  <textarea class="fallback-editor" value={content} oninput={handleTextareaChange}></textarea>
{:else}
  <div class="monaco-container" bind:this={container}></div>
{/if}

<style>
  .monaco-container { flex: 1; min-height: 300px; }
  .fallback-editor {
    flex: 1; min-height: 300px; background: var(--bg-primary);
    border: 1px solid var(--border-primary); border-radius: var(--radius-md);
    padding: 12px; font-family: var(--font-mono); font-size: 13px;
    color: var(--text-primary); resize: vertical;
  }
</style>
