<script lang="ts">
  import type { Snippet } from 'svelte';
  let { label = '', disabled = false, onclick, children }: { label?: string; disabled?: boolean; onclick?: () => void; children?: Snippet } = $props();
</script>

<button class="icon-btn" {disabled} {onclick} title={label}>
  {#if children}{@render children()}{/if}
</button>

<style>
  .icon-btn {
    width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
    border-radius: var(--radius-sm); color: var(--text-secondary); transition: all var(--transition-fast);
  }
  .icon-btn:hover:not(:disabled) { background: var(--bg-hover); color: var(--text-primary); }
  .icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
