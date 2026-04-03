<script lang="ts">
  let { size = 20 }: { size?: number } = $props();
</script>

<div class="spinner" style:width="{size}px" style:height="{size}px"></div>

<style>
  .spinner { border: 2px solid var(--border-primary); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 0.6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
