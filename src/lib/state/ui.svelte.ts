import type { Theme, UIConfig } from '$lib/types/ui';

class UIState {
  theme = $state<Theme>('dark');
  sidebarVisible = $state(true);
  contextPanelVisible = $state(true);
  splitRatio = $state(0.5);
  commandPaletteOpen = $state(false);
  settingsOpen = $state(false);
  huddleActive = $state(false);
  huddleConsultantIds = $state<string[]>([]);

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  toggleContextPanel() {
    this.contextPanelVisible = !this.contextPanelVisible;
  }

  toggleCommandPalette() {
    this.commandPaletteOpen = !this.commandPaletteOpen;
  }

  startHuddle(consultantIds: string[]) {
    this.huddleConsultantIds = consultantIds;
    this.huddleActive = true;
  }

  endHuddle() {
    this.huddleActive = false;
    this.huddleConsultantIds = [];
  }

  setTheme(theme: Theme) {
    this.theme = theme;
  }

  setSplitRatio(ratio: number) {
    this.splitRatio = Math.max(0.2, Math.min(0.8, ratio));
  }
}

export const uiState = new UIState();
