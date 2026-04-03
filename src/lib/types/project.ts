export interface Project {
  id: string;
  name: string;
  description: string;
  currentPhase: PhaseNumber;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreate {
  name: string;
  description: string;
}

export type PhaseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
