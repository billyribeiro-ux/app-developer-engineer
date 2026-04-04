<script lang="ts">
  import PhaseHeader from './PhaseHeader.svelte';
  import PhaseGateBanner from './PhaseGateBanner.svelte';
  import HandoffCeremony from './HandoffCeremony.svelte';
  import ChatPanel from '$lib/components/chat/ChatPanel.svelte';
  import ArtifactPanel from '$lib/components/artifacts/ArtifactPanel.svelte';
  import { uiState } from '$lib/state/ui.svelte';
  import { phaseState } from '$lib/state/phase.svelte';
  import { artifactState } from '$lib/state/artifact.svelte';
  import { CONSULTANTS } from '$lib/constants/consultants';
  import type { PhaseNumber } from '$lib/types/project';

  const canAdvance = $derived(phaseState.canAdvance(artifactState.artifacts) && phaseState.currentPhaseNumber < 7);
  const nextConsultant = $derived(phaseState.currentPhaseNumber < 7 ? CONSULTANTS[(phaseState.currentPhaseNumber + 1) as PhaseNumber] : null);
  let advanceDismissed = $state(false);

  $effect(() => {
    // Reset dismissed state when phase changes
    phaseState.currentPhaseNumber;
    advanceDismissed = false;
  });

  function autoAdvance() {
    if (phaseState.currentPhaseNumber < 7) {
      phaseState.setCurrentPhase((phaseState.currentPhaseNumber + 1) as PhaseNumber);
    }
  }

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
  {#if canAdvance && !advanceDismissed && nextConsultant}
    <div class="advance-banner">
      <span class="advance-text">Phase complete! Ready to meet <strong>{nextConsultant.name}</strong> ({nextConsultant.title})?</span>
      <div class="advance-actions">
        <button class="advance-dismiss" onclick={() => advanceDismissed = true}>Later</button>
        <button class="advance-btn" onclick={autoAdvance}>Advance →</button>
      </div>
    </div>
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

  .advance-banner {
    padding: 8px 16px; display: flex; align-items: center; justify-content: space-between;
    background: color-mix(in srgb, var(--success) 8%, var(--bg-surface));
    border-top: 1px solid color-mix(in srgb, var(--success) 25%, var(--border-primary));
    flex-shrink: 0; animation: slideUp 0.3s ease;
  }
  @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .advance-text { font-size: 13px; color: var(--text-primary); }
  .advance-actions { display: flex; gap: 8px; }
  .advance-dismiss { font-size: 12px; padding: 4px 12px; border-radius: var(--radius-sm); background: var(--bg-tertiary); color: var(--text-secondary); }
  .advance-btn { font-size: 12px; padding: 4px 14px; border-radius: var(--radius-sm); background: var(--success); color: white; font-weight: 600; }
  .advance-btn:hover { filter: brightness(1.1); }
</style>
