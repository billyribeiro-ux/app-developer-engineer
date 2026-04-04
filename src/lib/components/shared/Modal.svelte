<script lang="ts">
  import type { Snippet } from 'svelte';
  let { title, children, onclose }: { title: string; children: Snippet; onclose: () => void } = $props();
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-label={title} tabindex="-1" onclick={onclose} onkeydown={(e) => { if (e.key === 'Escape') onclose(); }}>
  <div class="modal" role="presentation" onclick={(e) => e.stopPropagation()}>
    <div class="modal-header">
      <h2>{title}</h2>
      <button class="close-btn" onclick={onclose}>×</button>
    </div>
    <div class="modal-body">{@render children()}</div>
  </div>
</div>

<style>
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
  .modal { background: var(--bg-surface); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); padding: 24px; width: 100%; max-width: 480px; box-shadow: var(--shadow-lg); }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .modal-header h2 { font-size: 18px; font-weight: 600; }
  .close-btn { font-size: 20px; color: var(--text-tertiary); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm); }
  .close-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
</style>
