<script lang="ts">
  import { projectState } from '$lib/state/project.svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { selectProject } from '$lib/services/project-service';
  import { formatRelative } from '$lib/utils/date';

  async function handleSelect(id: string) {
    await selectProject(id);
    goto(resolve('/project/[id]', { id }));
  }
</script>

<div class="project-list">
  <div class="list-header">
    <span class="list-title">Projects</span>
  </div>
  {#each projectState.projects as project (project.id)}
    <button class="project-item" onclick={() => handleSelect(project.id)}>
      <span class="project-name">{project.name}</span>
      <span class="project-date">{formatRelative(project.updatedAt)}</span>
    </button>
  {/each}
</div>

<style>
  .project-list { padding: 8px; }
  .list-header { padding: 8px; margin-bottom: 4px; }
  .list-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-tertiary); }
  .project-item {
    width: 100%; text-align: left; padding: 8px 10px; border-radius: var(--radius-md);
    display: flex; justify-content: space-between; align-items: center;
    transition: background var(--transition-fast);
  }
  .project-item:hover { background: var(--bg-hover); }
  .project-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
  .project-date { font-size: 11px; color: var(--text-tertiary); }
</style>
