<script lang="ts">
  import { renderMarkdown } from '$lib/utils/markdown';

  let { content }: { content: string } = $props();
  const html = $derived(renderMarkdown(content));
</script>

<div class="markdown">{@html html}</div>

<style>
  .markdown { font-size: 14px; line-height: 1.6; color: var(--text-primary); }
  .markdown :global(pre) { background: var(--bg-primary); padding: 12px; border-radius: var(--radius-md); overflow-x: auto; margin: 8px 0; }
  .markdown :global(code) { font-family: var(--font-mono); font-size: 0.9em; }
  .markdown :global(h1), .markdown :global(h2), .markdown :global(h3) { margin: 16px 0 8px; }
</style>
