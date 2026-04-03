<script lang="ts">
  let { label, variant = 'primary', disabled = false, onclick }: {
    label: string; variant?: 'primary' | 'secondary' | 'ghost'; disabled?: boolean; onclick?: () => void;
  } = $props();
</script>

<button class="btn {variant}" {disabled} {onclick}>{label}</button>

<style>
  .btn { padding: 8px 16px; border-radius: var(--radius-md); font-weight: 500; font-size: 13px; transition: all var(--transition-fast); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .primary { background: var(--accent-primary); color: white; }
  .primary:hover:not(:disabled) { background: var(--accent-hover); }
  .secondary { background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-primary); }
  .secondary:hover:not(:disabled) { background: var(--bg-hover); color: var(--text-primary); }
  .ghost { color: var(--text-secondary); }
  .ghost:hover:not(:disabled) { background: var(--bg-hover); color: var(--text-primary); }
</style>
