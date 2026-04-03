export interface PaletteCommand {
  id: string;
  title: string;
  description: string;
  section: string;
  shortcut?: string;
  action: string;
}

export const COMMANDS: PaletteCommand[] = [
  { id: 'new-project', title: 'New Project', description: 'Create a new project', section: 'Projects', shortcut: 'Cmd+N', action: 'project:new' },
  { id: 'open-settings', title: 'Settings', description: 'Open app settings', section: 'App', shortcut: 'Cmd+,', action: 'app:settings' },
  { id: 'toggle-sidebar', title: 'Toggle Sidebar', description: 'Show/hide sidebar', section: 'View', shortcut: 'Cmd+B', action: 'view:sidebar' },
  { id: 'toggle-context', title: 'Toggle Context Panel', description: 'Show/hide context panel', section: 'View', shortcut: 'Cmd+Shift+B', action: 'view:context' },
  { id: 'phase-1', title: 'Go to Product Definition', description: 'Switch to Phase 1 — Marcus Chen', section: 'Phases', action: 'phase:1' },
  { id: 'phase-2', title: 'Go to Architecture Blueprint', description: 'Switch to Phase 2 — Dr. Elena Vasquez', section: 'Phases', action: 'phase:2' },
  { id: 'phase-3', title: 'Go to Feature Decomposition', description: 'Switch to Phase 3 — James Okafor', section: 'Phases', action: 'phase:3' },
  { id: 'phase-4', title: 'Go to UI/UX Design', description: 'Switch to Phase 4 — Sophia Laurent', section: 'Phases', action: 'phase:4' },
  { id: 'phase-5', title: 'Go to Implementation', description: 'Switch to Phase 5 — Alex Rivera', section: 'Phases', action: 'phase:5' },
  { id: 'phase-6', title: 'Go to Testing & QA', description: 'Switch to Phase 6 — Dr. Priya Sharma', section: 'Phases', action: 'phase:6' },
  { id: 'phase-7', title: 'Go to Deployment', description: 'Switch to Phase 7 — Viktor Andersen', section: 'Phases', action: 'phase:7' },
  { id: 'export', title: 'Export Project', description: 'Export project as codebase scaffold', section: 'Projects', shortcut: 'Cmd+E', action: 'project:export' },
  { id: 'team-huddle', title: 'Team Huddle', description: 'Start a multi-consultant discussion', section: 'AI', action: 'ai:huddle' }
];
