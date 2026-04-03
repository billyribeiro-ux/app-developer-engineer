<script lang="ts">
  let { title = 'Nothing here yet', description = '' }: { title?: string; description?: string } = $props();
</script>

<div class="empty-state">
  <h3>{title}</h3>
  {#if description}<p>{description}</p>{/if}
</div>

<style>
  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; }
  h3 { font-size: 16px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; }
  p { font-size: 13px; color: var(--text-tertiary); }
</style>
