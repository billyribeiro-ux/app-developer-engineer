<script lang="ts">
  import PhaseTimelineStep from './PhaseTimelineStep.svelte';
  import { phaseState } from '$lib/state/phase.svelte';
  import { artifactState } from '$lib/state/artifact.svelte';
  import { CONSULTANTS } from '$lib/constants/consultants';
  import { PHASE_GATES } from '$lib/constants/phases';
  import type { PhaseNumber } from '$lib/types/project';

  function isUnlocked(phase: PhaseNumber): boolean {
    if (phase === 1) return true;
    const prevPhase = (phase - 1) as PhaseNumber;
    const gate = PHASE_GATES[prevPhase];
    if (!gate || gate.requiredArtifacts.length === 0) return true;
    const prevArtifacts = artifactState.getPhaseArtifacts(prevPhase);
    return gate.requiredArtifacts.every((req) =>
      prevArtifacts.some((a) => a.type === req)
    );
  }

  function handlePhaseClick(phase: PhaseNumber) {
    if (isUnlocked(phase) || phase <= phaseState.currentPhaseNumber) {
      phaseState.setCurrentPhase(phase);
    }
  }
</script>

<div class="phase-timeline">
  <div class="timeline-header">
    <span class="timeline-title">Phases</span>
  </div>
  {#each [1, 2, 3, 4, 5, 6, 7] as phase}
    {@const consultant = CONSULTANTS[phase as PhaseNumber]}
    {@const active = phase === phaseState.currentPhaseNumber}
    {@const unlocked = isUnlocked(phase as PhaseNumber)}
    {@const completed = phase < phaseState.currentPhaseNumber}
    <PhaseTimelineStep
      phaseNumber={phase}
      name={consultant.description}
      consultantName={consultant.name}
      accentColor={consultant.accentColor}
      {active}
      {unlocked}
      {completed}
      onclick={() => handlePhaseClick(phase as PhaseNumber)}
    />
  {/each}
</div>

<style>
  .phase-timeline { padding: 12px 8px; }
  .timeline-header { padding: 8px 10px; margin-bottom: 8px; }
  .timeline-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-tertiary); }
</style>
