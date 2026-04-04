<script lang="ts">
  import { toastState } from '$lib/state/toast.svelte';

  const TYPE_STYLES: Record<string, { icon: string; color: string }> = {
    success: { icon: '✓', color: 'var(--success)' },
    error: { icon: '✕', color: 'var(--error)' },
    warning: { icon: '⚠', color: 'var(--warning)' },
    info: { icon: 'ℹ', color: 'var(--accent-primary)' }
  };
</script>

{#if toastState.toasts.length > 0}
  <div class="toast-container">
    {#each toastState.toasts as toast (toast.id)}
      {@const style = TYPE_STYLES[toast.type]}
      <div class="toast" style:--toast-color={style.color}>
        <span class="toast-icon">{style.icon}</span>
        <span class="toast-message">{toast.message}</span>
        <button class="toast-close" onclick={() => toastState.remove(toast.id)}>×</button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    bottom: 40px;
    right: 16px;
    display: flex;
    flex-direction: column-reverse;
    gap: 8px;
    z-index: 200;
    pointer-events: none;
    max-width: 400px;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--bg-surface);
    border: 1px solid color-mix(in srgb, var(--toast-color) 40%, var(--border-primary));
    border-left: 3px solid var(--toast-color);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    animation: slideIn 200ms ease;
    pointer-events: all;
    min-width: 280px;
  }

  .toast-icon {
    font-size: 14px;
    color: var(--toast-color);
    flex-shrink: 0;
    width: 18px;
    text-align: center;
    font-weight: 700;
  }

  .toast-message {
    flex: 1;
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.4;
  }

  .toast-close {
    color: var(--text-tertiary);
    font-size: 16px;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    line-height: 1;
  }

  .toast-close:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
</style>
