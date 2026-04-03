<script lang="ts">
	import PhaseTimeline from '$lib/components/sidebar/PhaseTimeline.svelte';
	import { projectState } from '$lib/state/project.svelte';
</script>

<aside class="sidebar">
	{#if projectState.currentProject}
		<PhaseTimeline />
	{:else}
		<div class="empty">No project loaded.</div>
	{/if}
</aside>

<style>
	.sidebar {
		width: 260px;
		min-width: 260px;
		border-right: 1px solid var(--border-secondary);
		background: var(--bg-secondary);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	.empty {
		padding: 16px;
		color: var(--text-tertiary);
		font-size: 13px;
	}
</style>
