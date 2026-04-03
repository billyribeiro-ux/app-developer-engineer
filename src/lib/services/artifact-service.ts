import {
  createArtifact as createCmd,
  updateArtifact as updateCmd,
  deleteArtifact as deleteCmd,
  type ArtifactInput
} from './tauri-commands';
import { artifactState } from '$lib/state/artifact.svelte';
import type { Artifact, ArtifactType } from '$lib/types/artifact';
import type { PhaseNumber } from '$lib/types/project';

export async function saveArtifact(
  projectId: string,
  phaseNumber: PhaseNumber,
  type: ArtifactType,
  title: string,
  content: string
): Promise<Artifact> {
  const input: ArtifactInput = {
    project_id: projectId,
    phase_number: phaseNumber,
    type,
    title,
    content
  };
  const row = await createCmd(input);
  const artifact: Artifact = {
    id: row.id,
    projectId: row.project_id,
    phaseNumber: row.phase_number as PhaseNumber,
    type: row.type as ArtifactType,
    title: row.title,
    content: row.content,
    version: row.version,
    isStale: row.is_stale,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
  artifactState.addArtifact(artifact);
  return artifact;
}

export async function updateExistingArtifact(
  id: string,
  title?: string,
  content?: string,
  phaseNumber?: PhaseNumber
): Promise<void> {
  await updateCmd(id, title, content);
  artifactState.updateArtifact(id, {
    ...(title && { title }),
    ...(content && { content }),
    updatedAt: new Date().toISOString()
  });
  // Mark downstream as stale
  if (phaseNumber) {
    artifactState.markDownstreamStale(phaseNumber);
  }
}

export async function deleteExistingArtifact(id: string): Promise<void> {
  await deleteCmd(id);
  artifactState.removeArtifact(id);
}
