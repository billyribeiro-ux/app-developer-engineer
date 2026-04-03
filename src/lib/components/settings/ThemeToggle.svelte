<script lang="ts">
  import { uiState } from '$lib/state/ui.svelte';
</script>

<div class="theme-toggle">
  <button
    class="theme-option"
    class:active={uiState.theme === 'dark'}
    onclick={() => uiState.setTheme('dark')}
  >
    Dark
  </button>
  <button
    class="theme-option"
    class:active={uiState.theme === 'light'}
    onclick={() => uiState.setTheme('light')}
  >
    Light
  </button>
</div>

<style>
  .theme-toggle { display: flex; gap: 4px; background: var(--bg-tertiary); border-radius: var(--radius-md); padding: 3px; width: fit-content; }
  .theme-option { padding: 6px 16px; border-radius: var(--radius-sm); font-size: 13px; color: var(--text-secondary); transition: all var(--transition-fast); }
  .theme-option.active { background: var(--bg-surface); color: var(--text-primary); box-shadow: var(--shadow-sm); }
</style>
