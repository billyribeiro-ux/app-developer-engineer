<script lang="ts">
  import { uiState } from '$lib/state/ui.svelte';
  import ApiKeyInput from './ApiKeyInput.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
</script>

{#if uiState.settingsOpen}
  <!-- svelte-ignore a11y_autofocus -->
  <div class="overlay" role="dialog" aria-modal="true" aria-label="Settings" tabindex="-1" onclick={() => uiState.settingsOpen = false} onkeydown={(e) => { if (e.key === 'Escape') uiState.settingsOpen = false; }}>
    <div class="modal" role="presentation" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h2>Settings</h2>
        <button class="close-btn" onclick={() => uiState.settingsOpen = false}>×</button>
      </div>
      <div class="modal-body">
        <section class="setting-section">
          <h3>API Key</h3>
          <p class="setting-desc">Your Anthropic API key. Stored securely on your device. Falls back to ANTHROPIC_API_KEY env var.</p>
          <ApiKeyInput />
        </section>
        <section class="setting-section">
          <h3>Appearance</h3>
          <ThemeToggle />
        </section>
        <section class="setting-section">
          <h3>Keyboard Shortcuts</h3>
          <div class="shortcuts-list">
            <div class="shortcut-row"><span>Command Palette</span><kbd>⌘K</kbd></div>
            <div class="shortcut-row"><span>New Project</span><kbd>⌘N</kbd></div>
            <div class="shortcut-row"><span>Settings</span><kbd>⌘,</kbd></div>
            <div class="shortcut-row"><span>Toggle Sidebar</span><kbd>⌘B</kbd></div>
            <div class="shortcut-row"><span>Toggle Context</span><kbd>⌘⇧B</kbd></div>
            <div class="shortcut-row"><span>Send Message</span><kbd>⌘↵</kbd></div>
          </div>
        </section>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 150; backdrop-filter: blur(4px); }
  .modal { background: var(--bg-surface); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); width: 100%; max-width: 520px; box-shadow: var(--shadow-lg); }
  .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-secondary); }
  .modal-header h2 { font-size: 18px; font-weight: 600; }
  .close-btn { font-size: 20px; color: var(--text-tertiary); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm); }
  .close-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
  .modal-body { padding: 24px; max-height: 60vh; overflow-y: auto; }
  .setting-section { margin-bottom: 24px; }
  .setting-section:last-child { margin-bottom: 0; }
  .setting-section h3 { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
  .setting-desc { font-size: 12px; color: var(--text-tertiary); margin-bottom: 12px; }
  .shortcuts-list { display: flex; flex-direction: column; gap: 6px; }
  .shortcut-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 13px; color: var(--text-secondary); }
  kbd { font-family: var(--font-mono); font-size: 11px; background: var(--bg-tertiary); padding: 2px 6px; border-radius: var(--radius-sm); border: 1px solid var(--border-primary); color: var(--text-secondary); }
</style>
