import type { PhaseNumber } from './project';

export type PhaseStatus = 'locked' | 'active' | 'complete';

export interface Phase {
  id: string;
  projectId: string;
  phaseNumber: PhaseNumber;
  status: PhaseStatus;
}

export interface GateRequirement {
  requiredArtifacts: string[];
  description: string;
}
