import { marked, Renderer } from 'marked';
import { codeToHtml } from 'shiki';

// Configure marked for our use
marked.setOptions({
  gfm: true,
  breaks: true
});

// Unique counter for code block IDs
let codeBlockId = 0;

// Custom renderer that adds copy buttons to code blocks
const renderer = new Renderer();
renderer.code = function ({ text, lang }: { text: string; lang?: string | undefined }) {
  const id = `code-block-${++codeBlockId}`;
  const langLabel = lang || '';
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<div class="code-block-wrapper" id="${id}">
    <div class="code-block-header">
      <span class="code-block-lang">${langLabel}</span>
      <button class="code-block-copy" onclick="(function(btn){navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(text)}'));btn.textContent='Copied!';setTimeout(function(){btn.textContent='Copy'},2000)})(this)">Copy</button>
    </div>
    <pre><code class="language-${langLabel}">${escaped}</code></pre>
  </div>`;
};

marked.use({ renderer });

// Cache for Shiki-highlighted HTML
const highlightCache = new Map<string, string>();

export function renderMarkdown(text: string): string {
  return marked.parse(text) as string;
}

// Async version that applies Shiki highlighting after initial render
export async function highlightCodeBlocks(container: HTMLElement): Promise<void> {
  const codeBlocks = container.querySelectorAll('.code-block-wrapper pre code');
  for (const block of codeBlocks) {
    const code = block.textContent || '';
    const langClass = block.className.match(/language-(\w+)/);
    const lang = langClass?.[1] || 'text';
    if (!lang || lang === 'text' || lang === '') continue;

    const cacheKey = `${lang}:${code}`;
    let highlighted = highlightCache.get(cacheKey);
    if (!highlighted) {
      try {
        highlighted = await codeToHtml(code, {
          lang,
          theme: 'github-dark'
        });
        highlightCache.set(cacheKey, highlighted);
      } catch {
        continue;
      }
    }
    if (highlighted) {
      const pre = block.parentElement;
      if (pre) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = highlighted;
        const shikiPre = wrapper.querySelector('pre');
        if (shikiPre) {
          shikiPre.style.margin = '0';
          shikiPre.style.padding = '12px';
          shikiPre.style.background = 'transparent';
          pre.replaceWith(shikiPre);
        }
      }
    }
  }
}
