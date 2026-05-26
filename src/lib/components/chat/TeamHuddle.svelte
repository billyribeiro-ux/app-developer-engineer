<script lang="ts">
  import { CONSULTANTS } from '$lib/constants/consultants';
  import { uiState } from '$lib/state/ui.svelte';
  import type { PhaseNumber } from '$lib/types/project';

  let { mode = 'indicator' }: { mode?: 'picker' | 'indicator' } = $props();
  let selected = $state<string[]>([]);

  const allConsultants = Object.values(CONSULTANTS);

  function toggleConsultant(id: string) {
    if (selected.includes(id)) {
      selected = selected.filter((s) => s !== id);
    } else {
      selected = [...selected, id];
    }
  }

  function startHuddle() {
    if (selected.length < 2) return;
    uiState.startHuddle(selected);
  }

  const activeConsultants = $derived(
    uiState.huddleConsultantIds
      .map((id) => allConsultants.find((c) => c.id === id))
      .filter(Boolean)
  );
</script>

{#if mode === 'picker'}
  <div class="huddle-picker-overlay" role="dialog" aria-modal="true" aria-label="Team Huddle" tabindex="-1" onclick={() => uiState.endHuddle()} onkeydown={(e) => { if (e.key === 'Escape') uiState.endHuddle(); }}>
    <div class="huddle-picker" role="presentation" onclick={(e) => e.stopPropagation()}>
      <h3>Start a Team Huddle</h3>
      <p class="picker-hint">Select 2+ consultants for a multi-perspective discussion</p>
      <div class="consultant-grid">
        {#each allConsultants as c (c.id)}
          <button
            class="consultant-option"
            class:selected={selected.includes(c.id)}
            style:--accent={c.accentColor}
            onclick={() => toggleConsultant(c.id)}
          >
            <div class="option-avatar">{c.name.charAt(0)}</div>
            <div class="option-info">
              <span class="option-name">{c.name}</span>
              <span class="option-title">{c.title}</span>
            </div>
          </button>
        {/each}
      </div>
      <div class="picker-actions">
        <button class="cancel-btn" onclick={() => uiState.endHuddle()}>Cancel</button>
        <button class="start-btn" onclick={startHuddle} disabled={selected.length < 2}>
          Start Huddle ({selected.length} selected)
        </button>
      </div>
    </div>
  </div>
{:else}
  <div class="huddle-indicator">
    <div class="huddle-left">
      <span class="huddle-badge">HUDDLE</span>
      <div class="huddle-avatars">
        {#each activeConsultants as c (c?.id)}
          {#if c}
            <div class="mini-avatar" style:--accent={c.accentColor} title={c.name}>{c.name.charAt(0)}</div>
          {/if}
        {/each}
      </div>
      <span class="huddle-label">{activeConsultants.length} consultants active</span>
    </div>
    <button class="end-btn" onclick={() => uiState.endHuddle()}>End Huddle</button>
  </div>
{/if}

<style>
  .huddle-picker-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; backdrop-filter: blur(4px);
  }
  .huddle-picker {
    background: var(--bg-surface); border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg); padding: 28px; max-width: 520px; width: 100%;
    box-shadow: var(--shadow-lg);
  }
  .huddle-picker h3 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
  .picker-hint { font-size: 13px; color: var(--text-tertiary); margin-bottom: 20px; }

  .consultant-grid { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
  .consultant-option {
    display: flex; align-items: center; gap: 12px; padding: 10px 14px;
    border-radius: var(--radius-md); border: 1px solid var(--border-primary);
    background: var(--bg-primary); text-align: left; transition: all var(--transition-fast);
  }
  .consultant-option:hover { border-color: var(--accent); background: var(--bg-hover); }
  .consultant-option.selected { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, var(--bg-surface)); }

  .option-avatar {
    width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--accent); color: white; font-size: 14px; font-weight: 700;
  }
  .option-info { display: flex; flex-direction: column; }
  .option-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
  .option-title { font-size: 11px; color: var(--text-tertiary); }

  .picker-actions { display: flex; justify-content: flex-end; gap: 8px; }
  .cancel-btn { padding: 8px 16px; font-size: 13px; border-radius: var(--radius-md); background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-primary); }
  .start-btn { padding: 8px 16px; font-size: 13px; border-radius: var(--radius-md); background: var(--accent-primary); color: white; font-weight: 500; }
  .start-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .huddle-indicator {
    padding: 6px 16px; background: color-mix(in srgb, var(--accent-primary) 8%, var(--bg-surface));
    border-bottom: 1px solid color-mix(in srgb, var(--accent-primary) 20%, var(--border-primary));
    display: flex; align-items: center; justify-content: space-between;
  }
  .huddle-left { display: flex; align-items: center; gap: 8px; }
  .huddle-badge {
    font-size: 9px; font-weight: 700; letter-spacing: 0.1em; padding: 2px 6px;
    border-radius: 4px; background: var(--accent-primary); color: white;
  }
  .huddle-avatars { display: flex; gap: -4px; }
  .mini-avatar {
    width: 22px; height: 22px; border-radius: 50%; font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    background: var(--accent); color: white; border: 2px solid var(--bg-surface);
    margin-left: -4px;
  }
  .mini-avatar:first-child { margin-left: 0; }
  .huddle-label { font-size: 12px; color: var(--text-secondary); }
  .end-btn {
    font-size: 11px; padding: 3px 10px; border-radius: var(--radius-sm);
    background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-primary);
  }
  .end-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
</style>
