<script lang="ts">
  let { score }: { score: number } = $props();
  const color = $derived(score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--error)');
</script>

<span class="health-badge" style:--color={color}>{score}</span>

<style>
  .health-badge { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px; background: color-mix(in srgb, var(--color) 15%, transparent); color: var(--color); }
</style>
