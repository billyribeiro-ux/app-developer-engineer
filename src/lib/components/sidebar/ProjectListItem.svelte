<script lang="ts">
  let { name, date, active = false, onclick }: { name: string; date: string; active?: boolean; onclick: () => void } = $props();
</script>

<button class="item" class:active onclick={onclick}>
  <span class="name">{name}</span>
  <span class="date">{date}</span>
</button>

<style>
  .item { width: 100%; text-align: left; padding: 8px 10px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; transition: background var(--transition-fast); }
  .item:hover { background: var(--bg-hover); }
  .item.active { background: var(--bg-active); }
  .name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
  .date { font-size: 11px; color: var(--text-tertiary); }
</style>
