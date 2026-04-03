<script lang="ts">
  import ArtifactList from './ArtifactList.svelte';
  import ArtifactViewer from './ArtifactViewer.svelte';
  import { artifactState } from '$lib/state/artifact.svelte';
  import { phaseState } from '$lib/state/phase.svelte';

  const phaseArtifacts = $derived(artifactState.getPhaseArtifacts(phaseState.currentPhaseNumber));
</script>

<div class="artifact-panel">
  <ArtifactList artifacts={phaseArtifacts} />
  {#if artifactState.selectedArtifact}
    <ArtifactViewer artifact={artifactState.selectedArtifact} />
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
</style>
