<script lang="ts">
  import type { Artifact } from '$lib/types/artifact';
  import { renderMarkdown } from '$lib/utils/markdown';

  let { artifact }: { artifact: Artifact } = $props();

  const html = $derived(renderMarkdown(artifact.content));
</script>

<div class="viewer">
  <div class="viewer-header">
    <h3>{artifact.title}</h3>
    <span class="viewer-meta">v{artifact.version} · {artifact.type}</span>
  </div>
  <div class="viewer-content">{@html html}</div>
</div>

<style>
  .viewer { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .viewer-header {
    padding: 12px 16px; border-bottom: 1px solid var(--border-secondary);
    display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;
  }
  .viewer-header h3 { font-size: 14px; font-weight: 600; }
  .viewer-meta { font-size: 11px; color: var(--text-tertiary); }
  .viewer-content {
    flex: 1; overflow-y: auto; padding: 16px; font-size: 14px; line-height: 1.6;
  }
  .viewer-content :global(pre) { background: var(--bg-primary); padding: 12px; border-radius: var(--radius-md); overflow-x: auto; margin: 8px 0; font-family: var(--font-mono); font-size: 13px; }
  .viewer-content :global(code) { font-family: var(--font-mono); font-size: 0.9em; }
  .viewer-content :global(h1), .viewer-content :global(h2), .viewer-content :global(h3) { margin: 16px 0 8px; }
  .viewer-content :global(table) { border-collapse: collapse; width: 100%; margin: 8px 0; }
  .viewer-content :global(th), .viewer-content :global(td) { border: 1px solid var(--border-primary); padding: 6px 10px; font-size: 13px; }
  .viewer-content :global(th) { background: var(--bg-tertiary); }
</style>
