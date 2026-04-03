import type { Phase, GateRequirement } from '$lib/types/phase';
import type { PhaseNumber } from '$lib/types/project';
import type { Artifact } from '$lib/types/artifact';
import { PHASE_GATES } from '$lib/constants/phases';

class PhaseState {
  phases = $state<Phase[]>([]);
  currentPhaseNumber = $state<PhaseNumber>(1);

  get currentPhase(): Phase | undefined {
    return this.phases.find((p) => p.phaseNumber === this.currentPhaseNumber);
  }

  setPhases(phases: Phase[]) {
    this.phases = phases;
  }

  setCurrentPhase(phaseNumber: PhaseNumber) {
    this.currentPhaseNumber = phaseNumber;
  }

  canAdvance(artifacts: Artifact[]): boolean {
    const gate = PHASE_GATES[this.currentPhaseNumber];
    if (!gate || gate.requiredArtifacts.length === 0) return true;
    const phaseArtifacts = artifacts.filter(
      (a) => a.phaseNumber === this.currentPhaseNumber
    );
    return gate.requiredArtifacts.every((requiredType) =>
      phaseArtifacts.some((a) => a.type === requiredType)
    );
  }

  getGateStatus(phaseNumber: PhaseNumber): GateRequirement | undefined {
    return PHASE_GATES[phaseNumber];
  }
}

export const phaseState = new PhaseState();
