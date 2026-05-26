<script lang="ts">
	import { goto } from '$app/navigation';
	import { projectState } from '$lib/state/project.svelte';
	import { phaseState } from '$lib/state/phase.svelte';
	import { uiState } from '$lib/state/ui.svelte';
	import { CONSULTANTS } from '$lib/constants/consultants';

	const consultant = $derived(CONSULTANTS[phaseState.currentPhaseNumber]);
</script>

<header class="top-bar">
	<div class="left">
		<button class="back-btn" onclick={() => goto('/')}>
			← Projects
		</button>
		<span class="divider">/</span>
		<span class="project-name">{projectState.currentProject?.name ?? ''}</span>
	</div>
	<div class="center">
		<span class="phase-indicator" style:--accent={consultant.accentColor}>
			Phase {phaseState.currentPhaseNumber}: {consultant.description}
		</span>
	</div>
	<div class="right">
		<button
			class="icon-btn"
			onclick={() => uiState.toggleSidebar()}
			title="Toggle Sidebar (⌘B)"
			aria-pressed={uiState.sidebarVisible}
		>
			⊟
		</button>
		<button
			class="icon-btn"
			onclick={() => uiState.toggleContextPanel()}
			title="Toggle Context Panel (⌘⇧B)"
			aria-pressed={uiState.contextPanelVisible}
		>
			⊞
		</button>
		<div class="separator"></div>
		<button
			class="icon-btn"
			onclick={() => uiState.toggleCommandPalette()}
			title="Command Palette (⌘K)"
		>
			⌘K
		</button>
		<button
			class="icon-btn"
			onclick={() => (uiState.settingsOpen = true)}
			title="Settings (⌘,)"
		>
			⚙
		</button>
	</div>
</header>

<style>
	.top-bar {
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 16px;
		border-bottom: 1px solid var(--border-secondary);
		background: var(--bg-secondary);
		flex-shrink: 0;
		position: relative;
	}

	.left,
	.right {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
	}

	.right {
		justify-content: flex-end;
	}

	.back-btn {
		color: var(--text-secondary);
		font-size: 13px;
		padding: 4px 8px;
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
	}

	.back-btn:hover {
		color: var(--text-primary);
		background: var(--bg-hover);
	}

	.divider {
		color: var(--text-tertiary);
		font-size: 13px;
	}

	.project-name {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-primary);
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.center {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		pointer-events: none;
	}

	.phase-indicator {
		font-size: 12px;
		font-weight: 500;
		padding: 4px 12px;
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--accent) 12%, transparent);
		color: var(--accent);
		white-space: nowrap;
	}

	.separator {
		width: 1px;
		height: 16px;
		background: var(--border-primary);
		margin: 0 2px;
	}

	.icon-btn {
		color: var(--text-secondary);
		font-size: 12px;
		padding: 4px 8px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-primary);
		background: var(--bg-surface);
		transition: all var(--transition-fast);
		line-height: 1;
	}

	.icon-btn:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
		border-color: var(--border-primary);
	}

	.icon-btn[aria-pressed='true'] {
		background: var(--bg-active);
		color: var(--text-accent);
		border-color: var(--accent-primary);
	}
</style>
