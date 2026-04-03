<script lang="ts">
	import { onMount } from 'svelte';
	import AppShell from '$lib/components/layout/AppShell.svelte';
	import { selectProject } from '$lib/services/project-service';
	import { projectState } from '$lib/state/project.svelte';

	let { data } = $props();

	onMount(async () => {
		if (!projectState.currentProject || projectState.currentProject.id !== data.projectId) {
			await selectProject(data.projectId);
		}
	});
</script>

{#if projectState.currentProject}
	<AppShell />
{:else}
	<div class="loading">
		<div class="loading-spinner"></div>
		<span>Loading project...</span>
	</div>
{/if}

<style>
	.loading {
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		color: var(--text-secondary);
		font-size: 13px;
	}

	.loading-spinner {
		width: 24px;
		height: 24px;
		border: 2px solid var(--border-primary);
		border-top-color: var(--accent-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
</style>
