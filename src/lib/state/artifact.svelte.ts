import type { Artifact, ArtifactCreate } from '$lib/types/artifact';
import type { PhaseNumber } from '$lib/types/project';

class ArtifactState {
  artifacts = $state<Artifact[]>([]);
  selectedArtifactId = $state<string | null>(null);

  get selectedArtifact(): Artifact | undefined {
    return this.artifacts.find((a) => a.id === this.selectedArtifactId);
  }

  getPhaseArtifacts(phaseNumber: PhaseNumber): Artifact[] {
    return this.artifacts.filter((a) => a.phaseNumber === phaseNumber);
  }

  getPriorArtifacts(phaseNumber: PhaseNumber): Artifact[] {
    return this.artifacts.filter((a) => a.phaseNumber < phaseNumber);
  }

  setArtifacts(artifacts: Artifact[]) {
    this.artifacts = artifacts;
  }

  addArtifact(artifact: Artifact) {
    this.artifacts = [...this.artifacts, artifact];
  }

  updateArtifact(id: string, updates: Partial<Artifact>) {
    this.artifacts = this.artifacts.map((a) =>
      a.id === id ? { ...a, ...updates } : a
    );
  }

  removeArtifact(id: string) {
    this.artifacts = this.artifacts.filter((a) => a.id !== id);
    if (this.selectedArtifactId === id) {
      this.selectedArtifactId = null;
    }
  }

  selectArtifact(id: string | null) {
    this.selectedArtifactId = id;
  }

  markDownstreamStale(phaseNumber: PhaseNumber) {
    this.artifacts = this.artifacts.map((a) =>
      a.phaseNumber > phaseNumber ? { ...a, isStale: true } : a
    );
  }
}

export const artifactState = new ArtifactState();
