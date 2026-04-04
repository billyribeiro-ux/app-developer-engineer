<script lang="ts">
  import ArtifactList from './ArtifactList.svelte';
  import ArtifactViewer from './ArtifactViewer.svelte';
  import ArtifactEditor from './ArtifactEditor.svelte';
  import ArtifactDiffView from './ArtifactDiffView.svelte';
  import { artifactState } from '$lib/state/artifact.svelte';
  import { phaseState } from '$lib/state/phase.svelte';
  import { deleteExistingArtifact } from '$lib/services/artifact-service';

  const phaseArtifacts = $derived(artifactState.getPhaseArtifacts(phaseState.currentPhaseNumber));
  let mode = $state<'view' | 'edit' | 'diff'>('view');
  let lastContent = $state('');

  $effect(() => {
    const sel = artifactState.selectedArtifact;
    if (sel) {
      if (lastContent && lastContent !== sel.content) {
        // Content changed — keep lastContent for diff
      } else {
        lastContent = sel.content;
      }
    }
    mode = 'view';
  });

  async function handleDelete() {
    if (!artifactState.selectedArtifact) return;
    await deleteExistingArtifact(artifactState.selectedArtifact.id);
    mode = 'view';
  }
</script>

<div class="artifact-panel">
  <ArtifactList artifacts={phaseArtifacts} />
  {#if artifactState.selectedArtifact}
    <div class="artifact-toolbar">
      <div class="toolbar-tabs">
        <button class="tab" class:active={mode === 'view'} onclick={() => mode = 'view'}>View</button>
        <button class="tab" class:active={mode === 'edit'} onclick={() => mode = 'edit'}>Edit</button>
        <button class="tab" class:active={mode === 'diff'} onclick={() => mode = 'diff'}>Diff</button>
      </div>
      <button class="delete-btn" onclick={handleDelete} title="Delete artifact">🗑</button>
    </div>
    {#if mode === 'edit'}
      <ArtifactEditor artifact={artifactState.selectedArtifact} />
    {:else if mode === 'diff'}
      <ArtifactDiffView oldContent={lastContent} newContent={artifactState.selectedArtifact.content} />
    {:else}
      <ArtifactViewer artifact={artifactState.selectedArtifact} />
    {/if}
  {:else}
    <div class="empty">
      <p>No artifact selected</p>
      <p class="hint">Save artifacts from the chat or create them manually</p>
    </div>
  {/if}
</div>

<style>
  .artifact-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-tertiary); font-size: 13px; gap: 4px; }
  .hint { font-size: 11px; }
  .artifact-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 6px 12px; border-bottom: 1px solid var(--border-secondary);
    background: var(--bg-secondary); flex-shrink: 0;
  }
  .toolbar-tabs { display: flex; gap: 2px; background: var(--bg-tertiary); border-radius: var(--radius-sm); padding: 2px; }
  .tab {
    padding: 4px 12px; font-size: 12px; border-radius: var(--radius-sm);
    color: var(--text-secondary); transition: all var(--transition-fast);
  }
  .tab.active { background: var(--bg-surface); color: var(--text-primary); box-shadow: var(--shadow-sm); }
  .tab:hover:not(.active) { color: var(--text-primary); }
  .delete-btn {
    font-size: 13px; padding: 4px 8px; border-radius: var(--radius-sm);
    color: var(--text-tertiary); transition: all var(--transition-fast);
  }
  .delete-btn:hover { color: var(--error); background: rgba(239, 68, 68, 0.1); }
</style>
