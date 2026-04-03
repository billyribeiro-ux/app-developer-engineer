<script lang="ts">
	import { uiState } from '$lib/state/ui.svelte';
	import TopBar from './TopBar.svelte';
	import BottomBar from './BottomBar.svelte';
	import Sidebar from './Sidebar.svelte';
	import ContextPanel from './ContextPanel.svelte';
	import WorkspaceView from '$lib/components/workspace/WorkspaceView.svelte';
</script>

<div class="app-shell">
	<TopBar />
	<div class="main-area">
		{#if uiState.sidebarVisible}
			<Sidebar />
		{/if}
		<WorkspaceView />
		{#if uiState.contextPanelVisible}
			<ContextPanel />
		{/if}
	</div>
	<BottomBar />
</div>

<style>
	.app-shell {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--bg-primary);
	}

	.main-area {
		flex: 1;
		display: flex;
		overflow: hidden;
	}
</style>
