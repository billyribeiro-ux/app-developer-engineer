<script lang="ts">
  let { label, variant = 'default' }: { label: string; variant?: 'default' | 'success' | 'warning' | 'error' } = $props();
</script>

<span class="badge {variant}">{label}</span>

<style>
  .badge { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 10px; }
  .default { background: var(--bg-tertiary); color: var(--text-secondary); }
  .success { background: color-mix(in srgb, var(--success) 15%, transparent); color: var(--success); }
  .warning { background: color-mix(in srgb, var(--warning) 15%, transparent); color: var(--warning); }
  .error { background: color-mix(in srgb, var(--error) 15%, transparent); color: var(--error); }
</style>
