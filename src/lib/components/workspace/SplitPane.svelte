<script lang="ts">
  import type { Snippet } from 'svelte';
  let { left, right, ratio = 0.5 }: { left: Snippet; right: Snippet; ratio?: number } = $props();
</script>

<div class="split-pane">
  <div class="left" style:flex={ratio}>{@render left()}</div>
  <div class="divider"></div>
  <div class="right" style:flex={1 - ratio}>{@render right()}</div>
</div>

<style>
  .split-pane { display: flex; flex: 1; overflow: hidden; }
  .left, .right { overflow: hidden; display: flex; flex-direction: column; }
  .divider { width: 1px; background: var(--border-secondary); cursor: col-resize; }
</style>
