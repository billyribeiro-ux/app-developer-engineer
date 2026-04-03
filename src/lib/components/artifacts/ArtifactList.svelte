<script lang="ts">
  import ArtifactCard from './ArtifactCard.svelte';
  import type { Artifact } from '$lib/types/artifact';
  import { artifactState } from '$lib/state/artifact.svelte';

  let { artifacts }: { artifacts: Artifact[] } = $props();
</script>

<div class="artifact-list">
  <div class="list-header">
    <span class="count">{artifacts.length} artifact{artifacts.length !== 1 ? 's' : ''}</span>
  </div>
  <div class="list-items">
    {#each artifacts as artifact (artifact.id)}
      <ArtifactCard
        {artifact}
        active={artifactState.selectedArtifactId === artifact.id}
        onclick={() => artifactState.selectArtifact(artifact.id)}
      />
    {/each}
  </div>
</div>

<style>
  .artifact-list { border-bottom: 1px solid var(--border-secondary); padding: 8px; flex-shrink: 0; }
  .list-header { padding: 4px 8px; margin-bottom: 4px; }
  .count { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-tertiary); }
  .list-items { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
</style>
