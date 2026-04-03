<script lang="ts">
  import { renderMarkdown } from '$lib/utils/markdown';

  let { content = '' }: { content?: string } = $props();

  const html = $derived(content ? renderMarkdown(content) : '');
</script>

<div class="streaming">
  <div class="streaming-content">
    {#if content}
      <div class="markdown-content">{@html html}</div>
    {/if}
    <span class="cursor"></span>
  </div>
</div>

<style>
  .streaming { padding: 0 16px 8px; }
  .streaming-content {
    background: var(--bg-surface); border: 1px solid var(--border-primary);
    padding: 12px 16px; border-radius: 2px 12px 12px 12px;
    font-size: 14px; line-height: 1.6;
  }
  .cursor {
    display: inline-block; width: 2px; height: 16px;
    background: var(--accent-primary); vertical-align: text-bottom;
    animation: blink 1s infinite;
  }
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
  .markdown-content :global(pre) { background: var(--bg-primary); padding: 12px; border-radius: var(--radius-md); overflow-x: auto; }
  .markdown-content :global(code) { font-family: var(--font-mono); font-size: 0.9em; }
</style>
