<script lang="ts">
  let { oncreate }: { oncreate: (name: string, description: string) => void } = $props();
  let name = $state('');
  let description = $state('');
</script>

<div class="first-project">
  <div class="fp-content">
    <h2>Create Your First Project</h2>
    <p class="desc">Meet Marcus Chen, your Senior Strategist. He'll help you define the product before a single line of code is written.</p>

    <div class="form-group">
      <label for="fp-name">Project Name</label>
      <input id="fp-name" bind:value={name} placeholder="My Next Big Thing" autofocus />
    </div>
    <div class="form-group">
      <label for="fp-desc">What are you building? (optional)</label>
      <textarea id="fp-desc" bind:value={description} placeholder="A brief description of your idea..." rows="3"></textarea>
    </div>

    <button class="create-btn" onclick={() => oncreate(name, description)} disabled={!name.trim()}>
      Start Building
    </button>
  </div>
</div>

<style>
  .first-project { height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-primary); }
  .fp-content { max-width: 440px; padding: 40px; text-align: center; }
  h2 { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
  .desc { color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
  .form-group { margin-bottom: 16px; text-align: left; }
  .form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
  .form-group input, .form-group textarea { width: 100%; }
  .create-btn { padding: 12px 32px; background: var(--accent-primary); color: white; border-radius: var(--radius-md); font-size: 15px; font-weight: 500; margin-top: 8px; transition: all var(--transition-fast); }
  .create-btn:hover:not(:disabled) { background: var(--accent-hover); }
  .create-btn:disabled { opacity: 0.5; }
</style>
