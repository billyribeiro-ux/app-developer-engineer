// Type declaration for optional monaco-editor module
declare module 'monaco-editor' {
  export const editor: {
    create(container: HTMLElement, options: Record<string, unknown>): {
      onDidChangeModelContent(callback: () => void): void;
      getValue(): string;
      dispose(): void;
    };
  };
}
