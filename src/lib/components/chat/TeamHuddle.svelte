<script lang="ts">
  let { consultantIds = [], onclose }: { consultantIds?: string[]; onclose: () => void } = $props();
</script>

<div class="huddle-indicator">
  <span>Team Huddle Active — {consultantIds.length} consultants</span>
  <button onclick={onclose}>End Huddle</button>
</div>

<style>
  .huddle-indicator {
    padding: 8px 16px; background: color-mix(in srgb, var(--accent-primary) 10%, var(--bg-surface));
    border-bottom: 1px solid color-mix(in srgb, var(--accent-primary) 20%, var(--border-primary));
    display: flex; align-items: center; justify-content: space-between;
    font-size: 12px; color: var(--text-accent);
  }
  .huddle-indicator button {
    font-size: 11px; padding: 3px 10px; border-radius: var(--radius-sm);
    background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-primary);
  }
</style>
