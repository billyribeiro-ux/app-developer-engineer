<script lang="ts">
  import type { Snippet } from 'svelte';
  import { uiState } from '$lib/state/ui.svelte';

  let { left, right }: { left: Snippet; right: Snippet } = $props();

  let container: HTMLDivElement;
  let dragging = $state(false);

  function onPointerDown(e: PointerEvent) {
    dragging = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging || !container) return;
    const rect = container.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    uiState.setSplitRatio(ratio);
  }

  function onPointerUp() {
    dragging = false;
  }
</script>

<div class="split-pane" bind:this={container}>
  <div class="pane left" style:flex={uiState.splitRatio}>
    {@render left()}
  </div>
  <div
    class="divider"
    class:active={dragging}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    role="separator"
    aria-orientation="vertical"
  ></div>
  <div class="pane right" style:flex={1 - uiState.splitRatio}>
    {@render right()}
  </div>
</div>

<style>
  .split-pane {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  .pane {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .divider {
    width: 5px;
    cursor: col-resize;
    background: var(--border-secondary);
    flex-shrink: 0;
    transition: background 150ms ease;
    position: relative;
  }
  .divider:hover,
  .divider.active {
    background: var(--accent-primary);
  }
  .divider.active {
    width: 3px;
  }
</style>
