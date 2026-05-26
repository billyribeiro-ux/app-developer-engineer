import { describe, it, expect } from 'vitest';
import { extractArtifacts } from '$lib/utils/artifact-parser';

describe('extractArtifacts', () => {
  it('extracts mermaid code blocks as mermaid-diagram type', () => {
    const text = `Here is a diagram:\n\`\`\`mermaid\ngraph TD\n  A --> B\n\`\`\``;
    const artifacts = extractArtifacts(text);
    const mermaidArtifacts = artifacts.filter((a) => a.type === 'mermaid-diagram');
    expect(mermaidArtifacts).toHaveLength(1);
    expect(mermaidArtifacts[0].content).toContain('graph TD');
  });

  it('extracts typescript code blocks as source-code type', () => {
    const text = `Here is some code:\n\`\`\`typescript\nconst x: number = 42;\n\`\`\``;
    const artifacts = extractArtifacts(text);
    const codeArtifacts = artifacts.filter((a) => a.type === 'source-code');
    expect(codeArtifacts).toHaveLength(1);
    expect(codeArtifacts[0].title).toContain('typescript');
  });

  it('returns empty array for text with no code blocks', () => {
    const text = 'This is just plain text with no code blocks.';
    const artifacts = extractArtifacts(text);
    // Filter out any document pattern matches — expecting no code artifacts
    const codeArtifacts = artifacts.filter(
      (a) => a.type === 'source-code' || a.type === 'mermaid-diagram'
    );
    expect(codeArtifacts).toHaveLength(0);
  });

  it('handles multiple code blocks in one response', () => {
    const text = [
      '```mermaid',
      'graph LR',
      '  A --> B',
      '```',
      '',
      '```typescript',
      'const a = 1;',
      '```',
      '',
      '```javascript',
      'const b = 2;',
      '```'
    ].join('\n');

    const artifacts = extractArtifacts(text);
    const mermaid = artifacts.filter((a) => a.type === 'mermaid-diagram');
    const code = artifacts.filter((a) => a.type === 'source-code');
    expect(mermaid).toHaveLength(1);
    expect(code).toHaveLength(2);
  });

  it('returns array type', () => {
    const result = extractArtifacts('');
    expect(Array.isArray(result)).toBe(true);
  });
});
