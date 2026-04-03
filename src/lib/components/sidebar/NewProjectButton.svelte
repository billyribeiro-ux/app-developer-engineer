<script lang="ts">
  let { onclick }: { onclick: () => void } = $props();
</script>

<button class="new-project-btn" {onclick}>
  <span class="plus">+</span>
  <span>New Project</span>
</button>

<style>
  .new-project-btn {
    width: calc(100% - 16px); margin: 8px; padding: 10px;
    border: 1px dashed var(--border-primary); border-radius: var(--radius-md);
    display: flex; align-items: center; gap: 8px;
    color: var(--text-secondary); font-size: 13px;
    transition: all var(--transition-fast);
  }
  .new-project-btn:hover { border-color: var(--accent-primary); color: var(--text-accent); background: rgba(99, 102, 241, 0.05); }
  .plus { font-size: 16px; font-weight: 300; }
</style>
