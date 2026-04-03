<script lang="ts">
  import { phaseState } from '$lib/state/phase.svelte';
  import { PHASE_GATES } from '$lib/constants/phases';

  const gate = $derived(PHASE_GATES[phaseState.currentPhaseNumber]);
</script>

<div class="gate-banner">
  <span class="gate-icon">🔒</span>
  <span class="gate-text">{gate?.description ?? 'Complete requirements to proceed'}</span>
</div>

<style>
  .gate-banner {
    padding: 8px 16px; background: color-mix(in srgb, var(--warning) 8%, var(--bg-surface));
    border-top: 1px solid color-mix(in srgb, var(--warning) 20%, var(--border-primary));
    display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--warning); flex-shrink: 0;
  }
  .gate-icon { font-size: 14px; }
</style>
