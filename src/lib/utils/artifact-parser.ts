import type { ArtifactType } from '$lib/types/artifact';

export interface ParsedArtifact {
  type: ArtifactType;
  title: string;
  content: string;
}

// Patterns for detecting structured documents by their markdown headings
const DOCUMENT_PATTERNS: Array<{
  pattern: RegExp;
  type: ArtifactType;
  title: string;
}> = [
  { pattern: /^#\s+Product Requirements Document/m, type: 'prd', title: 'Product Requirements Document' },
  { pattern: /^#\s+PRD/m, type: 'prd', title: 'Product Requirements Document' },
  { pattern: /^#\s+Architecture\b/m, type: 'architecture-doc', title: 'Architecture Document' },
  { pattern: /^#\s+System Architecture/m, type: 'architecture-doc', title: 'System Architecture' },
  { pattern: /^#\s+Data Model/m, type: 'data-model', title: 'Data Model' },
  { pattern: /^#\s+Database Schema/m, type: 'data-model', title: 'Database Schema' },
  { pattern: /^#\s+API Contract/m, type: 'api-contract', title: 'API Contract' },
  { pattern: /^#\s+API Specification/m, type: 'api-contract', title: 'API Specification' },
  { pattern: /^#\s+Feature Breakdown/m, type: 'feature-breakdown', title: 'Feature Breakdown' },
  { pattern: /^#\s+Build Order/m, type: 'build-order', title: 'Build Order' },
  { pattern: /^#\s+Component Inventory/m, type: 'component-inventory', title: 'Component Inventory' },
  { pattern: /^#\s+State Map/m, type: 'state-map', title: 'State Map' },
  { pattern: /^#\s+Test Suite/m, type: 'test-suite', title: 'Test Suite' },
  { pattern: /^#\s+Test Plan/m, type: 'test-suite', title: 'Test Plan' },
  { pattern: /^#\s+CI\/CD/m, type: 'ci-config', title: 'CI/CD Configuration' },
];

const CODE_LANGUAGES = [
  'typescript', 'javascript', 'ts', 'js', 'rust', 'python', 'html', 'css',
  'svelte', 'json', 'yaml', 'yml', 'toml', 'sql', 'graphql', 'go', 'java',
  'kotlin', 'swift', 'c', 'cpp', 'csharp', 'ruby', 'php', 'shell', 'bash',
  'sh', 'dockerfile', 'terraform', 'hcl', 'vue', 'jsx', 'tsx'
];

export function extractArtifacts(text: string): ParsedArtifact[] {
  const artifacts: ParsedArtifact[] = [];

  // 1. Detect structured documents by heading patterns
  for (const { pattern, type, title } of DOCUMENT_PATTERNS) {
    if (pattern.test(text)) {
      // Extract the document section: from the matching heading to the end or next top-level heading
      const match = text.match(pattern);
      if (match && match.index !== undefined) {
        const start = match.index;
        // Find the end: next top-level heading that's NOT part of this document, or end of text
        const remaining = text.slice(start + match[0].length);
        const nextTopHeading = remaining.search(/\n(?=# [^#])/);
        const content = nextTopHeading >= 0
          ? text.slice(start, start + match[0].length + nextTopHeading).trim()
          : text.slice(start).trim();

        if (content.length > 50) {
          artifacts.push({ type, title, content });
        }
      }
    }
  }

  // 2. Extract fenced code blocks with language hints
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
    } else if (CODE_LANGUAGES.includes(lang.toLowerCase())) {
      artifacts.push({
        type: 'source-code',
        title: `Code (${lang})`,
        content: `\`\`\`${lang}\n${content}\n\`\`\``
      });
    }
  }

  return artifacts;
}
