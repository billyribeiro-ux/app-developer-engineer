<script lang="ts">
  import type { Artifact } from '$lib/types/artifact';

  let { artifact, active = false, onclick }: { artifact: Artifact; active?: boolean; onclick: () => void } = $props();

  const TYPE_ICONS: Record<string, string> = {
    'prd': '📋', 'architecture-doc': '🏗️', 'data-model': '🗄️', 'api-contract': '🔌',
    'feature-breakdown': '📊', 'build-order': '📐', 'component-inventory': '🧩',
    'state-map': '🗺️', 'wireframe': '🖼️', 'source-code': '💻', 'test-suite': '🧪',
    'ci-config': '⚙️', 'document': '📄', 'mermaid-diagram': '📈'
  };
</script>

<button class="card" class:active class:stale={artifact.isStale} {onclick}>
  <span class="type-icon">{TYPE_ICONS[artifact.type] || '📄'}</span>
  <div class="card-content">
    <span class="title">{artifact.title}</span>
    <span class="meta">v{artifact.version} · {artifact.type}</span>
  </div>
  {#if artifact.isStale}
    <span class="stale-badge" title="Content may be outdated">⚠</span>
  {/if}
</button>

<style>
  .card {
    min-width: 180px; padding: 10px 12px; background: var(--bg-surface);
    border: 1px solid var(--border-primary); border-radius: var(--radius-md);
    display: flex; align-items: center; gap: 8px; text-align: left;
    transition: all var(--transition-fast); flex-shrink: 0;
  }
  .card:hover { border-color: var(--accent-primary); background: var(--bg-hover); }
  .card.active { border-color: var(--accent-primary); background: var(--bg-active); }
  .card.stale { border-color: var(--warning); }
  .type-icon { font-size: 18px; flex-shrink: 0; }
  .card-content { display: flex; flex-direction: column; min-width: 0; }
  .title { font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .meta { font-size: 10px; color: var(--text-tertiary); }
  .stale-badge { color: var(--warning); font-size: 14px; }
</style>
