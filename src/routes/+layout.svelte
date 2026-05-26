<script lang="ts">
	import '../app.css';
	import { matchShortcut } from '$lib/utils/shortcuts';
	import { uiState } from '$lib/state/ui.svelte';
	import { phaseState } from '$lib/state/phase.svelte';
	import { goto } from '$app/navigation';
	import { exportAll } from '$lib/services/export-service';
	import SettingsModal from '$lib/components/settings/SettingsModal.svelte';
	import CommandPalette from '$lib/components/layout/CommandPalette.svelte';
	import ToastContainer from '$lib/components/shared/ToastContainer.svelte';
	import TeamHuddle from '$lib/components/chat/TeamHuddle.svelte';

	let { children } = $props();

	function handleKeydown(event: KeyboardEvent) {
		const action = matchShortcut(event);
		if (!action) return;

		event.preventDefault();
		switch (action) {
			case 'command-palette':
				uiState.toggleCommandPalette();
				break;
			case 'toggle-sidebar':
				uiState.toggleSidebar();
				break;
			case 'toggle-context':
				uiState.toggleContextPanel();
				break;
			case 'settings':
				uiState.settingsOpen = true;
				break;
			case 'new-project':
				goto('/');
				break;
			case 'export':
				exportAll();
				break;
			case 'next-phase':
				if (phaseState.currentPhaseNumber < 7) {
					phaseState.setCurrentPhase((phaseState.currentPhaseNumber + 1) as any);
				}
				break;
			case 'prev-phase':
				if (phaseState.currentPhaseNumber > 1) {
					phaseState.setCurrentPhase((phaseState.currentPhaseNumber - 1) as any);
				}
				break;
			case 'team-huddle':
				uiState.huddleActive = true;
				break;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="app-root" data-theme={uiState.theme}>
	{@render children()}
	<SettingsModal />
	<CommandPalette />
	<ToastContainer />
	{#if uiState.huddleActive && uiState.huddleConsultantIds.length < 2}
		<TeamHuddle mode="picker" />
	{/if}
</div>

<style>
	.app-root {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
</style>
