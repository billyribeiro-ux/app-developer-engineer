<script lang="ts">
  let { oldContent = '', newContent = '' }: { oldContent?: string; newContent?: string } = $props();

  type DiffLine = { type: 'same' | 'add' | 'remove'; text: string; lineNum: number };

  const diffLines = $derived.by(() => {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const result: DiffLine[] = [];
    const maxLen = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLen; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];
      if (oldLine === undefined && newLine !== undefined) {
        result.push({ type: 'add', text: newLine, lineNum: i + 1 });
      } else if (newLine === undefined && oldLine !== undefined) {
        result.push({ type: 'remove', text: oldLine, lineNum: i + 1 });
      } else if (oldLine !== newLine) {
        result.push({ type: 'remove', text: oldLine!, lineNum: i + 1 });
        result.push({ type: 'add', text: newLine!, lineNum: i + 1 });
      } else {
        result.push({ type: 'same', text: oldLine!, lineNum: i + 1 });
      }
    }
    return result;
  });

  const stats = $derived({
    added: diffLines.filter((l) => l.type === 'add').length,
    removed: diffLines.filter((l) => l.type === 'remove').length
  });
</script>

<div class="diff-view">
  <div class="diff-header">
    <span class="diff-stat add">+{stats.added}</span>
    <span class="diff-stat remove">-{stats.removed}</span>
  </div>
  <div class="diff-content">
    {#each diffLines as line, i (i)}
      <div class="diff-line {line.type}">
        <span class="line-prefix">{line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}</span>
        <span class="line-text">{line.text || ' '}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .diff-view { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .diff-header {
    padding: 8px 16px; border-bottom: 1px solid var(--border-secondary);
    display: flex; gap: 12px; flex-shrink: 0; background: var(--bg-secondary);
  }
  .diff-stat { font-size: 12px; font-weight: 600; font-family: var(--font-mono); }
  .diff-stat.add { color: var(--success); }
  .diff-stat.remove { color: var(--error); }
  .diff-content { flex: 1; overflow: auto; font-family: var(--font-mono); font-size: 13px; line-height: 1.6; }
  .diff-line { display: flex; padding: 0 16px; min-height: 22px; }
  .diff-line.add { background: color-mix(in srgb, var(--success) 8%, var(--bg-primary)); }
  .diff-line.remove { background: color-mix(in srgb, var(--error) 8%, var(--bg-primary)); }
  .diff-line.same { background: var(--bg-primary); }
  .line-prefix { width: 16px; flex-shrink: 0; color: var(--text-tertiary); user-select: none; }
  .diff-line.add .line-prefix { color: var(--success); }
  .diff-line.remove .line-prefix { color: var(--error); }
  .line-text { white-space: pre-wrap; word-break: break-all; }
</style>
