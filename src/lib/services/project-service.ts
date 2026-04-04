import {
  createProject as createProjectCmd,
  getProjects as getProjectsCmd,
  deleteProject as deleteProjectCmd,
  updateProject as updateProjectCmd,
  getArtifacts as getArtifactsCmd,
  type ProjectRow
} from './tauri-commands';
import { projectState } from '$lib/state/project.svelte';
import { toastState } from '$lib/state/toast.svelte';
import { artifactState } from '$lib/state/artifact.svelte';
import { phaseState } from '$lib/state/phase.svelte';
import type { Project, PhaseNumber } from '$lib/types/project';
import type { Artifact } from '$lib/types/artifact';

function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    currentPhase: row.current_phase as PhaseNumber,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function loadProjects(): Promise<void> {
  projectState.loading = true;
  try {
    const rows = await getProjectsCmd();
    projectState.setProjects(rows.map(rowToProject));
  } catch (e) {
    toastState.error('Failed to load projects: ' + String(e));
  } finally {
    projectState.loading = false;
  }
}

export async function createNewProject(name: string, description: string): Promise<Project> {
  try {
    const row = await createProjectCmd({ name, description });
    const project = rowToProject(row);
    projectState.addProject(project);
    toastState.success(`Project "${name}" created`);
    return project;
  } catch (e) {
    toastState.error('Failed to create project: ' + String(e));
    throw e;
  }
}

export async function deleteExistingProject(id: string): Promise<void> {
  try {
    await deleteProjectCmd(id);
    projectState.removeProject(id);
    toastState.success('Project deleted');
  } catch (e) {
    toastState.error('Failed to delete project: ' + String(e));
    throw e;
  }
}

export async function selectProject(id: string): Promise<void> {
  try {
  projectState.setCurrent(id);
  const artifactRows = await getArtifactsCmd(id);
  const artifacts: Artifact[] = artifactRows.map((r) => ({
    id: r.id,
    projectId: r.project_id,
    phaseNumber: r.phase_number as PhaseNumber,
    type: r.type as Artifact['type'],
    title: r.title,
    content: r.content,
    version: r.version,
    isStale: r.is_stale,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));
  artifactState.setArtifacts(artifacts);
  phaseState.setCurrentPhase(1);
  } catch (e) {
    toastState.error('Failed to load project: ' + String(e));
    throw e;
  }
}
