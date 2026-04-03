<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let { content = '', language = 'typescript', onchange }: {
    content?: string; language?: string; onchange?: (value: string) => void;
  } = $props();

  let container: HTMLDivElement;
  let editor: any;

  onMount(async () => {
    try {
      const monaco = await import('monaco-editor');
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
      console.error('Monaco failed to load:', e);
    }
  });

  onDestroy(() => {
    editor?.dispose();
  });
</script>

<div class="monaco-container" bind:this={container}></div>

<style>
  .monaco-container { flex: 1; min-height: 300px; }
</style>
