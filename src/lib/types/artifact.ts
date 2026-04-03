import type { PhaseNumber } from './project';

export type ArtifactType =
  | 'prd'
  | 'architecture-doc'
  | 'data-model'
  | 'api-contract'
  | 'feature-breakdown'
  | 'build-order'
  | 'component-inventory'
  | 'state-map'
  | 'wireframe'
  | 'source-code'
  | 'test-suite'
  | 'ci-config'
  | 'document'
  | 'mermaid-diagram';

export interface Artifact {
  id: string;
  projectId: string;
  phaseNumber: PhaseNumber;
  type: ArtifactType;
  title: string;
  content: string;
  version: number;
  isStale: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ArtifactCreate {
  projectId: string;
  phaseNumber: PhaseNumber;
  type: ArtifactType;
  title: string;
  content: string;
}
