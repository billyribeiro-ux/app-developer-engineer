import type { Consultant } from '$lib/types/consultant';
import type { PhaseNumber } from '$lib/types/project';

export const CONSULTANTS: Record<PhaseNumber, Consultant> = {
  1: {
    id: 'marcus',
    name: 'Marcus Chen',
    title: 'Senior Strategist',
    phaseNumber: 1,
    description: 'Product Definition',
    personality: 'Challenges assumptions ruthlessly. Asks the 5 questions that would kill your product if unanswered.',
    accentColor: '#6366f1',
    iconName: 'Lightbulb'
  },
  2: {
    id: 'elena',
    name: 'Dr. Elena Vasquez',
    title: 'Principal Architect',
    phaseNumber: 2,
    description: 'Architecture Blueprint',
    personality: 'Systems thinker. Obsessed with data models and API contracts. Rejects vague specs.',
    accentColor: '#8b5cf6',
    iconName: 'TreeStructure'
  },
  3: {
    id: 'james',
    name: 'James Okafor',
    title: 'Technical Analyst',
    phaseNumber: 3,
    description: 'Feature Decomposition',
    personality: 'Breaks everything into atomic units. If you can\'t define done, he won\'t let you build it.',
    accentColor: '#06b6d4',
    iconName: 'ListChecks'
  },
  4: {
    id: 'sophia',
    name: 'Sophia Laurent',
    title: 'Design Director',
    phaseNumber: 4,
    description: 'UI/UX Design',
    personality: 'Component-first thinker. Demands every state: loading, empty, error, success.',
    accentColor: '#f43f5e',
    iconName: 'PaintBrush'
  },
  5: {
    id: 'alex',
    name: 'Alex Rivera',
    title: 'Lead Engineer',
    phaseNumber: 5,
    description: 'Implementation',
    personality: 'Production code one unit at a time. Type-safe. No shortcuts. Rejects scope creep.',
    accentColor: '#22c55e',
    iconName: 'Code'
  },
  6: {
    id: 'priya',
    name: 'Dr. Priya Sharma',
    title: 'QA Lead',
    phaseNumber: 6,
    description: 'Testing & QA',
    personality: 'Tests against acceptance criteria, not code. Finds the edge cases you forgot.',
    accentColor: '#f59e0b',
    iconName: 'Bug'
  },
  7: {
    id: 'viktor',
    name: 'Viktor Andersen',
    title: 'DevOps Architect',
    phaseNumber: 7,
    description: 'Deployment',
    personality: 'CI/CD, monitoring, rollback plans. Ships it so you can see what happens after launch.',
    accentColor: '#ef4444',
    iconName: 'Rocket'
  }
};
