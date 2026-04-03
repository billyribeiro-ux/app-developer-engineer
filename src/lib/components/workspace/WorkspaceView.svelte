<script lang="ts">
  import PhaseHeader from './PhaseHeader.svelte';
  import PhaseGateBanner from './PhaseGateBanner.svelte';
  import ChatPanel from '$lib/components/chat/ChatPanel.svelte';
  import ArtifactPanel from '$lib/components/artifacts/ArtifactPanel.svelte';
  import { uiState } from '$lib/state/ui.svelte';
  import { phaseState } from '$lib/state/phase.svelte';
  import { artifactState } from '$lib/state/artifact.svelte';
</script>

<div class="workspace">
  <PhaseHeader />
  <div class="workspace-content">
    <div class="chat-pane" style:flex={uiState.splitRatio}>
      <ChatPanel />
    </div>
    <div class="divider"></div>
    <div class="artifact-pane" style:flex={1 - uiState.splitRatio}>
      <ArtifactPanel />
    </div>
  </div>
  {#if !phaseState.canAdvance(artifactState.artifacts)}
    <PhaseGateBanner />
  {/if}
</div>

<style>
  .workspace { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .workspace-content { flex: 1; display: flex; overflow: hidden; }
  .chat-pane { overflow: hidden; display: flex; flex-direction: column; }
  .artifact-pane { overflow: hidden; display: flex; flex-direction: column; }
  .divider { width: 1px; background: var(--border-secondary); cursor: col-resize; flex-shrink: 0; }
  .divider:hover { background: var(--accent-primary); }
</style>
