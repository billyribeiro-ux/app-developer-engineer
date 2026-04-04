export interface Shortcut {
  key: string;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: string;
}

export const SHORTCUTS: Shortcut[] = [
  { key: 'k', meta: true, action: 'command-palette' },
  { key: 'n', meta: true, action: 'new-project' },
  { key: ',', meta: true, action: 'settings' },
  { key: 'b', meta: true, action: 'toggle-sidebar' },
  { key: 'b', meta: true, shift: true, action: 'toggle-context' },
  { key: 'e', meta: true, action: 'export' },
  { key: ']', meta: true, action: 'next-phase' },
  { key: '[', meta: true, action: 'prev-phase' },
  { key: 'h', meta: true, shift: true, action: 'team-huddle' },
];

export function matchShortcut(event: KeyboardEvent): string | null {
  for (const shortcut of SHORTCUTS) {
    const metaMatch = shortcut.meta ? (event.metaKey || event.ctrlKey) : true;
    const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
    const altMatch = shortcut.alt ? event.altKey : !event.altKey;

    if (event.key.toLowerCase() === shortcut.key && metaMatch && shiftMatch && altMatch) {
      return shortcut.action;
    }
  }
  return null;
}
