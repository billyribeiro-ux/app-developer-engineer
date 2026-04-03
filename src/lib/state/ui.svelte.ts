import type { Theme, UIConfig } from '$lib/types/ui';

class UIState {
  theme = $state<Theme>('dark');
  sidebarVisible = $state(true);
  contextPanelVisible = $state(true);
  splitRatio = $state(0.5);
  commandPaletteOpen = $state(false);
  settingsOpen = $state(false);

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  toggleContextPanel() {
    this.contextPanelVisible = !this.contextPanelVisible;
  }

  toggleCommandPalette() {
    this.commandPaletteOpen = !this.commandPaletteOpen;
  }

  setTheme(theme: Theme) {
    this.theme = theme;
  }

  setSplitRatio(ratio: number) {
    this.splitRatio = Math.max(0.2, Math.min(0.8, ratio));
  }
}

export const uiState = new UIState();
