<script lang="ts">
  let { code, language = '' }: { code: string; language?: string } = $props();
  let copied = $state(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    copied = true;
    setTimeout(() => { copied = false; }, 2000);
  }
</script>

<div class="code-block">
  <div class="code-header">
    <span class="language">{language}</span>
    <button class="copy-btn" onclick={copy}>{copied ? 'Copied!' : 'Copy'}</button>
  </div>
  <pre><code>{code}</code></pre>
</div>

<style>
  .code-block { background: var(--bg-primary); border: 1px solid var(--border-primary); border-radius: var(--radius-md); overflow: hidden; margin: 8px 0; }
  .code-header { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: var(--bg-tertiary); border-bottom: 1px solid var(--border-primary); }
  .language { font-size: 11px; color: var(--text-tertiary); font-family: var(--font-mono); }
  .copy-btn { font-size: 11px; color: var(--text-secondary); padding: 2px 8px; border-radius: var(--radius-sm); transition: all var(--transition-fast); }
  .copy-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
  pre { padding: 12px; overflow-x: auto; margin: 0; }
  code { font-family: var(--font-mono); font-size: 13px; line-height: 1.5; color: var(--text-primary); }
</style>
