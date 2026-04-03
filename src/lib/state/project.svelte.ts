import type { Project, ProjectCreate } from '$lib/types/project';
import type { PhaseNumber } from '$lib/types/project';

class ProjectState {
  projects = $state<Project[]>([]);
  currentProjectId = $state<string | null>(null);
  loading = $state(false);

  get currentProject(): Project | undefined {
    return this.projects.find((p) => p.id === this.currentProjectId);
  }

  setProjects(projects: Project[]) {
    this.projects = projects;
  }

  setCurrent(id: string | null) {
    this.currentProjectId = id;
  }

  addProject(project: Project) {
    this.projects = [...this.projects, project];
  }

  removeProject(id: string) {
    this.projects = this.projects.filter((p) => p.id !== id);
    if (this.currentProjectId === id) {
      this.currentProjectId = null;
    }
  }

  updateProject(id: string, updates: Partial<Project>) {
    this.projects = this.projects.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
  }
}

export const projectState = new ProjectState();
