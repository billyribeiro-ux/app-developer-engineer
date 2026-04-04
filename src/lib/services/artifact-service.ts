import {
  createArtifact as createCmd,
  updateArtifact as updateCmd,
  deleteArtifact as deleteCmd,
  type ArtifactInput
} from './tauri-commands';
import { artifactState } from '$lib/state/artifact.svelte';
import { toastState } from '$lib/state/toast.svelte';
import type { Artifact, ArtifactType } from '$lib/types/artifact';
import type { PhaseNumber } from '$lib/types/project';

export async function saveArtifact(
  projectId: string,
  phaseNumber: PhaseNumber,
  type: ArtifactType,
  title: string,
  content: string
): Promise<Artifact> {
  try {
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
    toastState.success(`Artifact "${title}" saved`);
    return artifact;
  } catch (e) {
    toastState.error('Failed to save artifact: ' + String(e));
    throw e;
  }
}

export async function updateExistingArtifact(
  id: string,
  title?: string,
  content?: string,
  phaseNumber?: PhaseNumber
): Promise<void> {
  try {
    await updateCmd(id, title, content);
    artifactState.updateArtifact(id, {
      ...(title && { title }),
      ...(content && { content }),
      updatedAt: new Date().toISOString()
    });
    if (phaseNumber) {
      artifactState.markDownstreamStale(phaseNumber);
    }
    toastState.success('Artifact updated');
  } catch (e) {
    toastState.error('Failed to update artifact: ' + String(e));
    throw e;
  }
}

export async function deleteExistingArtifact(id: string): Promise<void> {
  try {
    await deleteCmd(id);
    artifactState.removeArtifact(id);
    toastState.success('Artifact deleted');
  } catch (e) {
    toastState.error('Failed to delete artifact: ' + String(e));
    throw e;
  }
}
