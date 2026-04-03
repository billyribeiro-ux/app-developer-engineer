export type Theme = 'dark' | 'light';

export interface UIConfig {
  theme: Theme;
  sidebarVisible: boolean;
  contextPanelVisible: boolean;
  splitRatio: number;
}
