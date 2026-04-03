<script lang="ts">
  import { setApiKey } from '$lib/services/tauri-commands';

  let { onnext }: { onnext: () => void } = $props();
  let key = $state('');
  let useEnvVar = $state(false);

  async function handleContinue() {
    if (key.trim()) {
      try {
        await setApiKey(key.trim());
      } catch (e) {
        console.error('Failed to save key:', e);
      }
    }
    onnext();
  }
</script>

<div class="setup">
  <div class="setup-content">
    <h2>Connect to Claude</h2>
    <p class="desc">CATALYST uses Claude to power your AI consultants. Enter your Anthropic API key.</p>

    {#if !useEnvVar}
      <input
        type="password"
        bind:value={key}
        placeholder="sk-ant-api03-..."
        class="key-input"
      />
      <button class="env-link" onclick={() => useEnvVar = true}>
        Or use ANTHROPIC_API_KEY environment variable
      </button>
    {:else}
      <div class="env-info">
        <p>Set the <code>ANTHROPIC_API_KEY</code> environment variable before launching CATALYST.</p>
        <button class="env-link" onclick={() => useEnvVar = false}>Enter key manually instead</button>
      </div>
    {/if}

    <div class="actions">
      <button class="skip-btn" onclick={onnext}>Skip for now</button>
      <button class="continue-btn" onclick={handleContinue} disabled={!useEnvVar && !key.trim()}>
        Continue
      </button>
    </div>
  </div>
</div>

<style>
  .setup { height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-primary); }
  .setup-content { max-width: 440px; padding: 40px; text-align: center; }
  h2 { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
  .desc { color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; }
  .key-input { width: 100%; font-family: var(--font-mono); font-size: 13px; padding: 12px; text-align: center; margin-bottom: 12px; }
  .env-link { color: var(--text-accent); font-size: 12px; background: none; margin-bottom: 24px; }
  .env-info { background: var(--bg-surface); border: 1px solid var(--border-primary); border-radius: var(--radius-md); padding: 16px; margin-bottom: 24px; }
  .env-info p { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; }
  code { font-family: var(--font-mono); background: var(--bg-tertiary); padding: 2px 6px; border-radius: var(--radius-sm); font-size: 12px; }
  .actions { display: flex; justify-content: center; gap: 12px; }
  .skip-btn { padding: 10px 20px; color: var(--text-secondary); font-size: 14px; border-radius: var(--radius-md); }
  .skip-btn:hover { background: var(--bg-hover); }
  .continue-btn { padding: 10px 24px; background: var(--accent-primary); color: white; border-radius: var(--radius-md); font-size: 14px; font-weight: 500; }
  .continue-btn:disabled { opacity: 0.5; }
</style>
