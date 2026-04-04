<script lang="ts">
  import type { Artifact } from '$lib/types/artifact';
  import { updateExistingArtifact } from '$lib/services/artifact-service';

  let { artifact }: { artifact: Artifact } = $props();
  let content = $state('');
  let saving = $state(false);

  // Initialize and sync content when artifact changes (Svelte 5 best practice)
  $effect(() => {
    content = artifact.content;
  });

  async function handleSave() {
    saving = true;
    await updateExistingArtifact(artifact.id, undefined, content);
    saving = false;
  }
</script>

<div class="editor">
  <div class="editor-header">
    <h3>{artifact.title}</h3>
    <button class="save-btn" onclick={handleSave} disabled={saving}>
      {saving ? 'Saving...' : 'Save'}
    </button>
  </div>
  <textarea class="editor-content" bind:value={content}></textarea>
</div>

<style>
  .editor { flex: 1; display: flex; flex-direction: column; }
  .editor-header {
    padding: 12px 16px; border-bottom: 1px solid var(--border-secondary);
    display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;
  }
  .editor-header h3 { font-size: 14px; font-weight: 600; }
  .save-btn { padding: 4px 12px; background: var(--accent-primary); color: white; border-radius: var(--radius-sm); font-size: 12px; }
  .editor-content {
    flex: 1; resize: none; background: var(--bg-primary); border: none; padding: 16px;
    font-family: var(--font-mono); font-size: 13px; line-height: 1.6; color: var(--text-primary);
    outline: none;
  }
</style>
