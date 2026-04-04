<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { projectState } from '$lib/state/project.svelte';
	import {
		loadProjects,
		createNewProject,
		deleteExistingProject,
		selectProject
	} from '$lib/services/project-service';
	import { getApiKey } from '$lib/services/tauri-commands';
	import { formatRelative } from '$lib/utils/date';
	import { CONSULTANTS } from '$lib/constants/consultants';
	import WelcomeScreen from '$lib/components/onboarding/WelcomeScreen.svelte';
	import ApiKeySetup from '$lib/components/onboarding/ApiKeySetup.svelte';
	import FirstProject from '$lib/components/onboarding/FirstProject.svelte';

	let showNewModal = $state(false);
	let newName = $state('');
	let newDescription = $state('');
	let onboardingStep = $state<'loading' | 'welcome' | 'apikey' | 'firstproject' | 'done'>('loading');
	let nameInputEl = $state<HTMLInputElement>();

	$effect(() => {
		if (showNewModal && nameInputEl) {
			nameInputEl.focus();
		}
	});

	onMount(async () => {
		await loadProjects();
		if (projectState.projects.length === 0) {
			try {
				const key = await getApiKey();
				if (!key) {
					onboardingStep = 'welcome';
					return;
				}
			} catch {
				onboardingStep = 'welcome';
				return;
			}
		}
		onboardingStep = 'done';
	});

	async function handleOnboardingCreate(name: string, description: string) {
		const project = await createNewProject(name, description);
		await selectProject(project.id);
		goto(`/project/${project.id}`);
	}

	async function handleCreate() {
		if (!newName.trim()) return;
		const project = await createNewProject(newName.trim(), newDescription.trim());
		showNewModal = false;
		newName = '';
		newDescription = '';
		await selectProject(project.id);
		goto(`/project/${project.id}`);
	}

	async function handleOpen(id: string) {
		await selectProject(id);
		goto(`/project/${id}`);
	}

	async function handleDelete(id: string) {
		await deleteExistingProject(id);
	}

	function handleModalKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			showNewModal = false;
		}
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			handleCreate();
		}
	}
</script>

{#if onboardingStep === 'loading'}
	<div class="loading-fullscreen">
		<div class="loading-spinner"></div>
	</div>
{:else if onboardingStep === 'welcome'}
	<WelcomeScreen onnext={() => onboardingStep = 'apikey'} />
{:else if onboardingStep === 'apikey'}
	<ApiKeySetup onnext={() => onboardingStep = 'firstproject'} />
{:else if onboardingStep === 'firstproject'}
	<FirstProject oncreate={handleOnboardingCreate} />
{:else}
<div class="dashboard">
	<header class="dashboard-header">
		<div class="logo">
			<h1>CATALYST</h1>
			<span class="tagline">AI Development Studio</span>
		</div>
		<button class="btn-primary" onclick={() => (showNewModal = true)}>+ New Project</button>
	</header>

	<main class="project-grid">
		{#if projectState.loading}
			<div class="empty-state">
				<div class="loading-spinner"></div>
				<p>Loading projects...</p>
			</div>
		{:else if projectState.projects.length === 0}
			<div class="empty-state">
				<div class="empty-icon">◈</div>
				<h2>Welcome to CATALYST</h2>
				<p>Create your first project to get started with your elite AI team.</p>
				<button class="btn-primary" onclick={() => (showNewModal = true)}>
					Create First Project
				</button>
			</div>
		{:else}
			{#each projectState.projects as project (project.id)}
				{@const consultant = CONSULTANTS[project.currentPhase]}
				<div
					class="project-card"
					role="button"
					tabindex="0"
					onclick={() => handleOpen(project.id)}
					onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(project.id); }}
				>
					<div class="card-header">
						<h3>{project.name}</h3>
						<button
							class="card-delete"
							onclick={(e) => {
								e.stopPropagation();
								handleDelete(project.id);
							}}
							title="Delete project"
							aria-label="Delete {project.name}"
						>
							×
						</button>
					</div>
					<p class="card-description">{project.description || 'No description'}</p>
					<div class="card-footer">
						<span class="phase-badge" style:--phase-accent={consultant.accentColor}>
							Phase {project.currentPhase}: {consultant.description}
						</span>
						<span class="card-date">{formatRelative(project.updatedAt)}</span>
					</div>
				</div>
			{/each}
		{/if}
	</main>

	{#if showNewModal}
		<div
			class="modal-overlay"
			role="dialog"
			aria-modal="true"
			aria-label="New Project"
			tabindex="-1"
			onclick={() => (showNewModal = false)}
			onkeydown={handleModalKeydown}
		>
			<div class="modal" onclick={(e) => e.stopPropagation()} role="presentation">
				<h2>New Project</h2>
				<div class="form-group">
					<label for="project-name">Project Name</label>
					<input
						id="project-name"
						bind:value={newName}
						bind:this={nameInputEl}
						placeholder="My App"
						onkeydown={(e) => {
							if (e.key === 'Enter') handleCreate();
							if (e.key === 'Escape') showNewModal = false;
						}}
					/>
				</div>
				<div class="form-group">
					<label for="project-desc">Description</label>
					<textarea
						id="project-desc"
						bind:value={newDescription}
						placeholder="What are you building?"
						rows={3}
					></textarea>
				</div>
				<div class="modal-actions">
					<button class="btn-secondary" onclick={() => (showNewModal = false)}>Cancel</button>
					<button class="btn-primary" onclick={handleCreate} disabled={!newName.trim()}>
						Create Project
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
{/if}

<style>
	.loading-fullscreen {
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-primary);
	}
	.dashboard {
		height: 100vh;
		display: flex;
		flex-direction: column;
		padding: 40px;
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40px;
		flex-shrink: 0;
	}

	.logo h1 {
		font-size: 28px;
		font-weight: 700;
		letter-spacing: -0.5px;
		background: linear-gradient(135deg, var(--text-primary) 60%, var(--accent-primary));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.tagline {
		display: block;
		color: var(--text-tertiary);
		font-size: 12px;
		margin-top: 2px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.btn-primary {
		background: var(--accent-primary);
		color: white;
		padding: 8px 16px;
		border-radius: var(--radius-md);
		font-weight: 500;
		transition:
			background var(--transition-fast),
			transform var(--transition-fast);
		font-size: 13px;
	}

	.btn-primary:hover {
		background: var(--accent-hover);
	}

	.btn-primary:active {
		transform: scale(0.98);
	}

	.btn-primary:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		transform: none;
	}

	.btn-secondary {
		background: var(--bg-tertiary);
		color: var(--text-secondary);
		padding: 8px 16px;
		border-radius: var(--radius-md);
		font-weight: 500;
		border: 1px solid var(--border-primary);
		transition: all var(--transition-fast);
		font-size: 13px;
	}

	.btn-secondary:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
	}

	.project-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 16px;
		flex: 1;
		overflow-y: auto;
		align-content: start;
		padding-bottom: 20px;
	}

	.project-card {
		background: var(--bg-surface);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-lg);
		padding: 20px;
		text-align: left;
		transition: all var(--transition-fast);
		display: flex;
		flex-direction: column;
		gap: 12px;
		cursor: pointer;
	}

	.project-card:hover {
		border-color: var(--accent-primary);
		background: var(--bg-hover);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.project-card:active {
		transform: translateY(0);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.card-header h3 {
		font-size: 15px;
		font-weight: 600;
		color: var(--text-primary);
		line-height: 1.3;
	}

	.card-delete {
		color: var(--text-tertiary);
		font-size: 18px;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
		flex-shrink: 0;
		line-height: 1;
	}

	.card-delete:hover {
		color: var(--error);
		background: rgba(239, 68, 68, 0.12);
	}

	.card-description {
		color: var(--text-secondary);
		font-size: 13px;
		line-height: 1.5;
		flex: 1;
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: auto;
		gap: 8px;
	}

	.phase-badge {
		font-size: 11px;
		font-weight: 500;
		padding: 3px 8px;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--phase-accent, var(--accent-primary)) 15%, transparent);
		color: var(--phase-accent, var(--accent-primary));
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.card-date {
		color: var(--text-tertiary);
		font-size: 11px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.empty-state {
		grid-column: 1 / -1;
		text-align: center;
		padding: 80px 20px;
		color: var(--text-secondary);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.empty-icon {
		font-size: 48px;
		color: var(--text-tertiary);
		margin-bottom: 8px;
	}

	.empty-state h2 {
		font-size: 22px;
		color: var(--text-primary);
		margin-bottom: 4px;
	}

	.empty-state p {
		margin-bottom: 12px;
		color: var(--text-secondary);
		max-width: 360px;
	}

	.loading-spinner {
		width: 24px;
		height: 24px;
		border: 2px solid var(--border-primary);
		border-top-color: var(--accent-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: 8px;
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.65);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		backdrop-filter: blur(4px);
		animation: fadeIn 150ms ease;
	}

	.modal {
		background: var(--bg-surface);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-lg);
		padding: 24px;
		width: 100%;
		max-width: 480px;
		box-shadow: var(--shadow-lg);
		animation: slideUp 150ms ease;
	}

	.modal h2 {
		font-size: 17px;
		font-weight: 600;
		margin-bottom: 20px;
		color: var(--text-primary);
	}

	.form-group {
		margin-bottom: 16px;
	}

	.form-group label {
		display: block;
		font-size: 12px;
		font-weight: 500;
		color: var(--text-secondary);
		margin-bottom: 6px;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 24px;
	}
</style>
