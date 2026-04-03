<script lang="ts">
  let { oldContent = '', newContent = '' }: { oldContent?: string; newContent?: string } = $props();
</script>

<div class="diff-view">
  <div class="diff-pane old"><pre>{oldContent}</pre></div>
  <div class="diff-pane new"><pre>{newContent}</pre></div>
</div>

<style>
  .diff-view { display: flex; flex: 1; overflow: hidden; }
  .diff-pane { flex: 1; overflow: auto; padding: 16px; font-family: var(--font-mono); font-size: 13px; }
  .old { background: color-mix(in srgb, var(--error) 5%, var(--bg-primary)); }
  .new { background: color-mix(in srgb, var(--success) 5%, var(--bg-primary)); }
  pre { white-space: pre-wrap; }
</style>
