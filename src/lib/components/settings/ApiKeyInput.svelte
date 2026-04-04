<script lang="ts">
  import { onMount } from 'svelte';
  import { getApiKey, setApiKey, validateApiKey } from '$lib/services/tauri-commands';
  import { toastState } from '$lib/state/toast.svelte';

  let key = $state('');
  let masked = $state(true);
  let saving = $state(false);
  let hasKey = $state(false);
  let statusMsg = $state('');
  let statusType = $state<'success' | 'warning' | 'error'>('warning');

  onMount(async () => {
    try {
      const existing = await getApiKey();
      if (existing) {
        hasKey = true;
        key = existing;
        statusMsg = 'API key configured';
        statusType = 'success';
      } else {
        statusMsg = 'No API key — set one above or use ANTHROPIC_API_KEY env var';
        statusType = 'warning';
      }
    } catch {
      statusMsg = 'No API key — set one above or use ANTHROPIC_API_KEY env var';
      statusType = 'warning';
    }
  });

  async function handleSave() {
    if (!key.trim() || saving) return;
    saving = true;
    statusMsg = 'Saving and validating...';
    statusType = 'warning';

    try {
      await setApiKey(key.trim());
      hasKey = true;

      // Validate the key against the Anthropic API
      const result = await validateApiKey(key.trim());
      statusMsg = result;
      statusType = 'success';
      toastState.success('API key saved and validated!');
    } catch (e) {
      const errMsg = String(e);
      statusMsg = errMsg;
      // Key might be saved but invalid/no credits
      if (errMsg.includes('credit') || errMsg.includes('balance')) {
        statusType = 'error';
        toastState.error(errMsg);
      } else if (errMsg.includes('Invalid')) {
        statusType = 'error';
        hasKey = false;
        toastState.error(errMsg);
      } else {
        statusType = 'error';
        toastState.error('Failed to validate API key: ' + errMsg);
      }
    } finally {
      saving = false;
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
    <button class="save-btn" onclick={handleSave} disabled={!key.trim() || saving}>
      {saving ? 'Validating...' : 'Save & Test'}
    </button>
  </div>
  <span class="status {statusType}">{statusMsg}</span>
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
  .error { color: var(--error); }
</style>
