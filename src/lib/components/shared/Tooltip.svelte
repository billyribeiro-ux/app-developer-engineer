<script lang="ts">
  import type { Snippet } from 'svelte';
  let { text, children }: { text: string; children: Snippet } = $props();
</script>

<span class="tooltip-wrapper" title={text}>
  {@render children()}
</span>

<style>
  .tooltip-wrapper { position: relative; display: inline-flex; }
</style>
