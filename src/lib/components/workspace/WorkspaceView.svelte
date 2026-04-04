<script lang="ts">
  import PhaseHeader from './PhaseHeader.svelte';
  import PhaseGateBanner from './PhaseGateBanner.svelte';
  import HandoffCeremony from './HandoffCeremony.svelte';
  import ChatPanel from '$lib/components/chat/ChatPanel.svelte';
  import ArtifactPanel from '$lib/components/artifacts/ArtifactPanel.svelte';
  import { uiState } from '$lib/state/ui.svelte';
  import { phaseState } from '$lib/state/phase.svelte';
  import { artifactState } from '$lib/state/artifact.svelte';

  let handoff = $state<{ from: number; to: number } | null>(null);
  let lastPhase = $state(phaseState.currentPhaseNumber);

  $effect(() => {
    const current = phaseState.currentPhaseNumber;
    if (current !== lastPhase && current > lastPhase && lastPhase > 0) {
      handoff = { from: lastPhase, to: current };
    }
    lastPhase = current;
  });

  function completeHandoff() {
    handoff = null;
  }

  // Draggable split pane
  let dragging = $state(false);
  let workspaceEl = $state<HTMLDivElement>();

  function startDrag() {
    dragging = true;
  }

  function onDrag(e: MouseEvent) {
    if (!dragging || !workspaceEl) return;
    const rect = workspaceEl.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    uiState.splitRatio = Math.max(0.2, Math.min(0.8, ratio));
  }

  function stopDrag() {
    dragging = false;
  }
</script>

<svelte:window onmousemove={onDrag} onmouseup={stopDrag} />

{#if handoff}
  <HandoffCeremony fromPhase={handoff.from} toPhase={handoff.to} onComplete={completeHandoff} />
{/if}

<div class="workspace">
  <PhaseHeader />
  <div class="workspace-content" bind:this={workspaceEl}>
    <div class="chat-pane" style:flex={uiState.splitRatio}>
      <ChatPanel />
    </div>
    <button
      class="divider"
      class:active={dragging}
      aria-label="Resize panels"
      onmousedown={startDrag}
    ></button>
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
  .divider {
    width: 4px; background: var(--border-secondary); cursor: col-resize; flex-shrink: 0;
    transition: background var(--transition-fast);
  }
  .divider:hover, .divider.active { background: var(--accent-primary); }
</style>
