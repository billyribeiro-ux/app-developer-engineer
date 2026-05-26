<script lang="ts">
  import type { Artifact } from '$lib/types/artifact';
  import { formatDate } from '$lib/utils/date';

  let { artifact }: { artifact: Artifact } = $props();
</script>

<div class="version-history">
  <div class="history-header">
    <span class="title">Version History</span>
  </div>
  <div class="version-list">
    {#each Array.from({ length: artifact.version }, (_, i) => artifact.version - i) as version (version)}
      <div class="version-item" class:current={version === artifact.version}>
        <span class="version-number">v{version}</span>
        {#if version === artifact.version}
          <span class="version-date">{formatDate(artifact.updatedAt)}</span>
          <span class="current-badge">Current</span>
        {:else}
          <span class="version-date">Previous version</span>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .version-history { padding: 12px; }
  .history-header { margin-bottom: 8px; }
  .title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-tertiary); }
  .version-list { display: flex; flex-direction: column; gap: 4px; }
  .version-item {
    display: flex; align-items: center; gap: 8px; padding: 6px 8px;
    border-radius: var(--radius-sm); font-size: 12px; color: var(--text-secondary);
  }
  .version-item.current { background: var(--bg-active); }
  .version-number { font-weight: 600; color: var(--text-primary); font-family: var(--font-mono); }
  .version-date { color: var(--text-tertiary); }
  .current-badge {
    margin-left: auto; font-size: 10px; font-weight: 500;
    padding: 1px 6px; border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--accent-primary) 15%, transparent);
    color: var(--text-accent);
  }
</style>
