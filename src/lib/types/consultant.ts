import type { PhaseNumber } from './project';

export interface Consultant {
  id: string;
  name: string;
  title: string;
  phaseNumber: PhaseNumber;
  description: string;
  personality: string;
  accentColor: string;
  iconName: string;
}

export interface ConsultantMemory {
  id: string;
  consultantId: string;
  projectId: string;
  key: string;
  value: string;
  createdAt: string;
}

export interface HealthScore {
  phaseNumber: PhaseNumber;
  completeness: number;
  clarity: number;
  consistency: number;
  overall: number;
  suggestions: string[];
}
