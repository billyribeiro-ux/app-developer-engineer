<script lang="ts">
  import { phaseState } from '$lib/state/phase.svelte';
  import { CONSULTANTS } from '$lib/constants/consultants';

  const consultant = $derived(CONSULTANTS[phaseState.currentPhaseNumber]);
</script>

<div class="phase-header">
  <div class="consultant-avatar" style:--accent={consultant.accentColor}>
    {consultant.name.charAt(0)}
  </div>
  <div class="consultant-info">
    <span class="consultant-name">{consultant.name}</span>
    <span class="consultant-title">{consultant.title} — {consultant.description}</span>
  </div>
  <div class="consultant-personality">{consultant.personality}</div>
</div>

<style>
  .phase-header {
    padding: 12px 16px; border-bottom: 1px solid var(--border-secondary);
    display: flex; align-items: center; gap: 12px; background: var(--bg-surface); flex-shrink: 0;
  }
  .consultant-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: var(--accent); color: white; font-weight: 700; font-size: 14px; flex-shrink: 0;
  }
  .consultant-info { display: flex; flex-direction: column; }
  .consultant-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
  .consultant-title { font-size: 12px; color: var(--text-secondary); }
  .consultant-personality { margin-left: auto; font-size: 11px; color: var(--text-tertiary); max-width: 300px; text-align: right; }
</style>
