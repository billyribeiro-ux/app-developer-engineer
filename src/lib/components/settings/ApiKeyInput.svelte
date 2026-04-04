<script lang="ts">
  import { onMount } from 'svelte';
  import { getApiKey, setApiKey } from '$lib/services/tauri-commands';
  import { toastState } from '$lib/state/toast.svelte';

  let key = $state('');
  let masked = $state(true);
  let saved = $state(false);
  let hasKey = $state(false);

  onMount(async () => {
    try {
      const existing = await getApiKey();
      if (existing) {
        hasKey = true;
        key = existing;
      }
    } catch {
      // No key set yet
    }
  });

  async function handleSave() {
    if (!key.trim()) return;
    try {
      await setApiKey(key.trim());
      saved = true;
      hasKey = true;
      setTimeout(() => { saved = false; }, 2000);
    } catch (e) {
      console.error('Failed to save API key:', e);
      toastState.error('Failed to save API key: ' + String(e));
    }
  }
</script>

<div class="api-key-input">
  <div class="input-row">
    <input
      type={masked ? 'password' : 'text'}
      bind:value={key}
      placeholder="sk-ant-..."
    />
    <button class="toggle-btn" onclick={() => masked = !masked}>
      {masked ? 'Show' : 'Hide'}
    </button>
    <button class="save-btn" onclick={handleSave} disabled={!key.trim()}>
      {saved ? 'Saved!' : 'Save'}
    </button>
  </div>
  {#if hasKey}
    <span class="status success">API key configured</span>
  {:else}
    <span class="status warning">No API key — set one above or use ANTHROPIC_API_KEY env var</span>
  {/if}
</div>

<style>
  .api-key-input { display: flex; flex-direction: column; gap: 8px; }
  .input-row { display: flex; gap: 6px; }
  .input-row input { flex: 1; font-family: var(--font-mono); font-size: 12px; }
  .toggle-btn { padding: 8px 12px; background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-primary); border-radius: var(--radius-md); font-size: 12px; }
  .save-btn { padding: 8px 12px; background: var(--accent-primary); color: white; border-radius: var(--radius-md); font-size: 12px; }
  .save-btn:disabled { opacity: 0.5; }
  .status { font-size: 11px; }
  .success { color: var(--success); }
  .warning { color: var(--warning); }
</style>
