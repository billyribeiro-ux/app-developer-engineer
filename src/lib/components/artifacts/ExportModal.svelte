<script lang="ts">
  import { exportDocBundle, exportCodeScaffold, exportAll } from '$lib/services/export-service';
  import { projectState } from '$lib/state/project.svelte';

  let { open = false, onclose }: { open?: boolean; onclose: () => void } = $props();

  let exporting = $state(false);

  async function handleExport(type: 'docs' | 'code' | 'all') {
    exporting = true;
    try {
      if (type === 'docs') await exportDocBundle();
      else if (type === 'code') await exportCodeScaffold();
      else await exportAll();
      onclose();
    } finally {
      exporting = false;
    }
  }
</script>

{#if open}
  <div class="overlay" role="dialog" aria-modal="true" tabindex="-1" onclick={onclose} onkeydown={(e) => { if (e.key === 'Escape') onclose(); }}>
    <div class="modal" role="presentation" onclick={(e) => e.stopPropagation()}>
      <h2>Export Project</h2>
      <p class="subtitle">{projectState.currentProject?.name ?? 'Project'}</p>
      <div class="options">
        <button class="option-card" onclick={() => handleExport('docs')} disabled={exporting}>
          <span class="option-icon">📄</span>
          <span class="option-title">Documentation Bundle</span>
          <span class="option-desc">PRD, architecture, features, designs — all phases as markdown</span>
        </button>
        <button class="option-card" onclick={() => handleExport('code')} disabled={exporting}>
          <span class="option-icon">💻</span>
          <span class="option-title">Code Scaffold</span>
          <span class="option-desc">Source code, tests, and CI configs from implementation phases</span>
        </button>
        <button class="option-card" onclick={() => handleExport('all')} disabled={exporting}>
          <span class="option-icon">📦</span>
          <span class="option-title">Full Export</span>
          <span class="option-desc">Everything — documentation + code in one bundle</span>
        </button>
      </div>
      <p class="hint">Exports are copied to your clipboard as markdown</p>
      <div class="actions">
        <button class="cancel-btn" onclick={onclose}>Cancel</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.65);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; backdrop-filter: blur(4px);
  }
  .modal {
    background: var(--bg-surface); border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg); padding: 24px; width: 100%; max-width: 520px;
    box-shadow: var(--shadow-lg);
  }
  .modal h2 { font-size: 17px; font-weight: 600; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: var(--text-secondary); margin-bottom: 20px; }
  .options { display: flex; flex-direction: column; gap: 8px; }
  .option-card {
    text-align: left; padding: 14px 16px; border: 1px solid var(--border-primary);
    border-radius: var(--radius-md); transition: all 150ms ease;
    display: flex; flex-direction: column; gap: 4px;
  }
  .option-card:hover:not(:disabled) { border-color: var(--accent-primary); background: var(--bg-hover); }
  .option-card:disabled { opacity: 0.5; }
  .option-icon { font-size: 18px; }
  .option-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
  .option-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.4; }
  .hint { font-size: 11px; color: var(--text-tertiary); margin-top: 12px; text-align: center; }
  .actions { display: flex; justify-content: flex-end; margin-top: 16px; }
  .cancel-btn {
    padding: 6px 14px; border-radius: var(--radius-md);
    background: var(--bg-tertiary); color: var(--text-secondary);
    border: 1px solid var(--border-primary); font-size: 13px;
  }
  .cancel-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
</style>
