<script lang="ts">
	import '../app.css';
	import { matchShortcut } from '$lib/utils/shortcuts';
	import { uiState } from '$lib/state/ui.svelte';
	import { goto } from '$app/navigation';
	import SettingsModal from '$lib/components/settings/SettingsModal.svelte';
	import CommandPalette from '$lib/components/layout/CommandPalette.svelte';

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
				break;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="app-root" data-theme={uiState.theme}>
	{@render children()}
	<SettingsModal />
	<CommandPalette />
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
