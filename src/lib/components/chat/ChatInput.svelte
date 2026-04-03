<script lang="ts">
  let {
    onsend,
    disabled = false,
    placeholder = 'Type a message...'
  }: {
    onsend: (content: string) => void;
    disabled?: boolean;
    placeholder?: string;
  } = $props();

  let value = $state('');
  let textarea: HTMLTextAreaElement;

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const content = value.trim();
    if (!content || disabled) return;
    onsend(content);
    value = '';
    if (textarea) textarea.style.height = 'auto';
  }

  function autoResize() {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }
</script>

<div class="chat-input-wrapper">
  <textarea
    bind:this={textarea}
    bind:value
    {placeholder}
    {disabled}
    oninput={autoResize}
    onkeydown={handleKeydown}
    rows="1"
  ></textarea>
  <button class="send-btn" onclick={handleSend} disabled={disabled || !value.trim()}>
    Send
  </button>
</div>

<style>
  .chat-input-wrapper {
    padding: 12px 16px; border-top: 1px solid var(--border-secondary);
    display: flex; gap: 8px; align-items: flex-end; background: var(--bg-surface); flex-shrink: 0;
  }
  textarea {
    flex: 1; resize: none; background: var(--bg-tertiary); border: 1px solid var(--border-primary);
    border-radius: var(--radius-md); padding: 10px 12px; font-size: 14px; line-height: 1.4;
    color: var(--text-primary); outline: none; min-height: 40px; max-height: 200px;
    font-family: var(--font-sans); transition: border-color var(--transition-fast);
  }
  textarea:focus { border-color: var(--accent-primary); }
  textarea:disabled { opacity: 0.5; }
  .send-btn {
    padding: 8px 16px; background: var(--accent-primary); color: white;
    border-radius: var(--radius-md); font-weight: 500; font-size: 13px;
    transition: background var(--transition-fast); white-space: nowrap;
  }
  .send-btn:hover:not(:disabled) { background: var(--accent-hover); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
