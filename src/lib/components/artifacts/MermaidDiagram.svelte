<script lang="ts">
  let { code }: { code: string } = $props();
  let container = $state<HTMLDivElement>();
  let error = $state('');

  $effect(() => {
    if (!container) return;
    const el = container;
    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({ startOnLoad: false, theme: 'dark' });
        const { svg } = await mermaid.render('mermaid-' + crypto.randomUUID().slice(0, 8), code);
        if (!cancelled && el) el.innerHTML = svg;
      } catch (e) {
        if (!cancelled) error = String(e);
      }
    })();

    return () => { cancelled = true; };
  });
</script>

<div class="mermaid-wrapper">
  {#if error}
    <div class="error">Failed to render diagram: {error}</div>
  {:else}
    <div class="diagram" bind:this={container}></div>
  {/if}
</div>

<style>
  .mermaid-wrapper { padding: 16px; overflow: auto; }
  .diagram :global(svg) { max-width: 100%; height: auto; }
  .error { color: var(--error); font-size: 13px; padding: 12px; background: color-mix(in srgb, var(--error) 10%, var(--bg-surface)); border-radius: var(--radius-md); }
</style>
