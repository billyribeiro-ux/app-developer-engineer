<script lang="ts">
  let { content = '', language = 'typescript', onchange }: {
    content?: string; language?: string; onchange?: (value: string) => void;
  } = $props();

  let container = $state<HTMLDivElement>();
  let editor: any;

  $effect(() => {
    if (!container) return;
    const el = container;
    let disposed = false;

    (async () => {
      try {
        const monaco = await import('monaco-editor');
        if (disposed) return;
        editor = monaco.editor.create(el, {
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
    })();

    return () => {
      disposed = true;
      editor?.dispose();
    };
  });
</script>

<div class="monaco-container" bind:this={container}></div>

<style>
  .monaco-container { flex: 1; min-height: 300px; }
</style>
