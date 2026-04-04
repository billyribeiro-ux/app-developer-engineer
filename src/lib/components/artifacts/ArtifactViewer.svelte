<script lang="ts">
  import { tick } from 'svelte';
  import type { Artifact } from '$lib/types/artifact';
  import { renderMarkdown, highlightCodeBlocks } from '$lib/utils/markdown';
  import MermaidDiagram from './MermaidDiagram.svelte';

  let { artifact }: { artifact: Artifact } = $props();
  let contentEl = $state<HTMLDivElement>();

  const isMermaid = $derived(artifact.type === 'mermaid-diagram');
  const html = $derived(!isMermaid ? renderMarkdown(artifact.content) : '');

  let copied = $state(false);
  async function copyContent() {
    await navigator.clipboard.writeText(artifact.content);
    copied = true;
    setTimeout(() => { copied = false; }, 2000);
  }

  $effect(() => {
    if (html && contentEl) {
      const el = contentEl;
      tick().then(() => highlightCodeBlocks(el));
    }
  });
</script>

<div class="viewer">
  <div class="viewer-header">
    <div class="viewer-title-row">
      <h3>{artifact.title}</h3>
      <span class="viewer-meta">v{artifact.version} · {artifact.type}</span>
    </div>
    <button class="copy-btn" onclick={copyContent}>{copied ? '✓ Copied' : 'Copy'}</button>
  </div>
  {#if isMermaid}
    <MermaidDiagram code={artifact.content} />
  {:else}
    <div class="viewer-content" bind:this={contentEl}>{@html html}</div>
  {/if}
</div>

<style>
  .viewer { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .viewer-header {
    padding: 12px 16px; border-bottom: 1px solid var(--border-secondary);
    display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;
  }
  .viewer-title-row { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
  .viewer-header h3 { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .viewer-meta { font-size: 11px; color: var(--text-tertiary); white-space: nowrap; }
  .copy-btn {
    font-size: 11px; padding: 4px 10px; border-radius: var(--radius-sm);
    color: var(--text-secondary); background: var(--bg-tertiary); border: 1px solid var(--border-primary);
    transition: all var(--transition-fast); flex-shrink: 0;
  }
  .copy-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
  .viewer-content {
    flex: 1; overflow-y: auto; padding: 16px; font-size: 14px; line-height: 1.6;
  }
  .viewer-content :global(.code-block-wrapper) {
    background: var(--bg-primary); border: 1px solid var(--border-primary);
    border-radius: var(--radius-md); overflow: hidden; margin: 8px 0;
  }
  .viewer-content :global(.code-block-header) {
    display: flex; justify-content: space-between; align-items: center;
    padding: 4px 12px; background: var(--bg-tertiary); border-bottom: 1px solid var(--border-primary);
  }
  .viewer-content :global(.code-block-lang) { font-size: 11px; color: var(--text-tertiary); font-family: var(--font-mono); }
  .viewer-content :global(.code-block-copy) {
    font-size: 11px; color: var(--text-secondary); padding: 2px 8px;
    border-radius: var(--radius-sm); cursor: pointer; background: none; border: none;
  }
  .viewer-content :global(.code-block-copy:hover) { background: var(--bg-hover); color: var(--text-primary); }
  .viewer-content :global(pre) { background: var(--bg-primary); padding: 12px; border-radius: var(--radius-md); overflow-x: auto; margin: 0; font-family: var(--font-mono); font-size: 13px; }
  .viewer-content :global(code) { font-family: var(--font-mono); font-size: 0.9em; }
  .viewer-content :global(h1), .viewer-content :global(h2), .viewer-content :global(h3) { margin: 16px 0 8px; }
  .viewer-content :global(table) { border-collapse: collapse; width: 100%; margin: 8px 0; }
  .viewer-content :global(th), .viewer-content :global(td) { border: 1px solid var(--border-primary); padding: 6px 10px; font-size: 13px; }
  .viewer-content :global(th) { background: var(--bg-tertiary); }
</style>
