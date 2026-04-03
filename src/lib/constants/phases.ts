import type { PhaseNumber } from '$lib/types/project';
import type { GateRequirement } from '$lib/types/phase';

export const PHASE_NAMES: Record<PhaseNumber, string> = {
  1: 'Product Definition',
  2: 'Architecture Blueprint',
  3: 'Feature Decomposition',
  4: 'UI/UX Design',
  5: 'Implementation',
  6: 'Testing & QA',
  7: 'Deployment'
};

export const PHASE_GATES: Record<PhaseNumber, GateRequirement> = {
  1: {
    requiredArtifacts: ['prd'],
    description: 'Complete the Product Requirements Document to proceed'
  },
  2: {
    requiredArtifacts: ['architecture-doc', 'data-model'],
    description: 'Define architecture and data models to proceed'
  },
  3: {
    requiredArtifacts: ['feature-breakdown', 'build-order'],
    description: 'Complete feature decomposition and build order to proceed'
  },
  4: {
    requiredArtifacts: ['component-inventory'],
    description: 'Finish component inventory to proceed'
  },
  5: {
    requiredArtifacts: ['source-code'],
    description: 'Generate implementation code to proceed'
  },
  6: {
    requiredArtifacts: ['test-suite'],
    description: 'Generate test suite to proceed'
  },
  7: {
    requiredArtifacts: [],
    description: 'Final phase — export when ready'
  }
};
