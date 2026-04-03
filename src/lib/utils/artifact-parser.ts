import type { ArtifactType } from '$lib/types/artifact';

export interface ParsedArtifact {
  type: ArtifactType;
  title: string;
  content: string;
}

export function extractArtifacts(text: string): ParsedArtifact[] {
  const artifacts: ParsedArtifact[] = [];

  // Extract fenced code blocks with language hints
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const lang = match[1] || '';
    const content = match[2].trim();

    if (lang === 'mermaid') {
      artifacts.push({
        type: 'mermaid-diagram',
        title: 'Diagram',
        content
      });
    } else if (['typescript', 'javascript', 'ts', 'js', 'rust', 'python', 'html', 'css', 'svelte'].includes(lang)) {
      artifacts.push({
        type: 'source-code',
        title: `Code (${lang})`,
        content: `\`\`\`${lang}\n${content}\n\`\`\``
      });
    }
  }

  return artifacts;
}
