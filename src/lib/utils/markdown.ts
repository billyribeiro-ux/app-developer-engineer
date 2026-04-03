import { marked } from 'marked';

// Configure marked for our use
marked.setOptions({
  gfm: true,
  breaks: true
});

export function renderMarkdown(text: string): string {
  return marked.parse(text) as string;
}
