<script lang="ts">
  import { tick } from 'svelte';
  import type { Message } from '$lib/types/message';
  import { renderMarkdown, highlightCodeBlocks } from '$lib/utils/markdown';
  import { CONSULTANTS } from '$lib/constants/consultants';
  import type { PhaseNumber } from '$lib/types/project';
  import { extractArtifacts } from '$lib/utils/artifact-parser';
  import { saveArtifact } from '$lib/services/artifact-service';
  import { projectState } from '$lib/state/project.svelte';
  import { phaseState } from '$lib/state/phase.svelte';

  let { message }: { message: Message } = $props();
  let contentEl = $state<HTMLDivElement>();

  const isUser = $derived(message.role === 'user');
  const consultant = $derived(
    message.consultantId
      ? Object.values(CONSULTANTS).find((c) => c.id === message.consultantId)
      : CONSULTANTS[message.phaseNumber as PhaseNumber]
  );
  const parsedArtifacts = $derived(
    !isUser ? extractArtifacts(message.content) : []
  );
  const html = $derived(!isUser ? renderMarkdown(message.content) : '');

  $effect(() => {
    if (html && contentEl) {
      const el = contentEl;
      tick().then(() => highlightCodeBlocks(el));
    }
  });

  async function handleSaveArtifact(index: number) {
    const artifact = parsedArtifacts[index];
    if (!projectState.currentProject) return;
    await saveArtifact(
      projectState.currentProject.id,
      phaseState.currentPhaseNumber,
      artifact.type,
      artifact.title,
      artifact.content
    );
  }
</script>

<div class="bubble" class:user={isUser} class:assistant={!isUser}>
  {#if !isUser && consultant}
    <div class="avatar" style:--accent={consultant.accentColor}>
      {consultant.name.charAt(0)}
    </div>
  {/if}
  <div class="content">
    {#if !isUser && consultant}
      <span class="sender">{consultant.name}</span>
    {/if}
    {#if isUser}
      <p class="user-text">{message.content}</p>
    {:else}
      <div class="markdown-content" bind:this={contentEl}>{@html html}</div>
      {#if parsedArtifacts.length > 0}
        <div class="artifact-actions">
          {#each parsedArtifacts as artifact, i}
            <button class="save-artifact-btn" onclick={() => handleSaveArtifact(i)}>
              Save as Artifact: {artifact.title}
            </button>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .bubble { display: flex; gap: 10px; max-width: 85%; }
  .bubble.user { align-self: flex-end; flex-direction: row-reverse; }
  .bubble.assistant { align-self: flex-start; }

  .avatar {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--accent); color: white; font-size: 12px; font-weight: 700;
  }

  .content { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .sender { font-size: 12px; font-weight: 600; color: var(--text-secondary); }

  .user-text {
    background: var(--accent-primary); color: white;
    padding: 10px 14px; border-radius: 12px 12px 2px 12px;
    font-size: 14px; line-height: 1.5;
  }

  .markdown-content {
    background: var(--bg-surface); border: 1px solid var(--border-primary);
    padding: 12px 16px; border-radius: 2px 12px 12px 12px;
    font-size: 14px; line-height: 1.6;
  }

  .markdown-content :global(.code-block-wrapper) {
    background: var(--bg-primary); border: 1px solid var(--border-primary);
    border-radius: var(--radius-md); overflow: hidden; margin: 8px 0;
  }
  .markdown-content :global(.code-block-header) {
    display: flex; justify-content: space-between; align-items: center;
    padding: 4px 12px; background: var(--bg-tertiary); border-bottom: 1px solid var(--border-primary);
  }
  .markdown-content :global(.code-block-lang) {
    font-size: 11px; color: var(--text-tertiary); font-family: var(--font-mono);
  }
  .markdown-content :global(.code-block-copy) {
    font-size: 11px; color: var(--text-secondary); padding: 2px 8px;
    border-radius: var(--radius-sm); cursor: pointer; background: none; border: none;
  }
  .markdown-content :global(.code-block-copy:hover) {
    background: var(--bg-hover); color: var(--text-primary);
  }

  .markdown-content :global(pre) {
    background: var(--bg-primary); padding: 12px; border-radius: var(--radius-md);
    overflow-x: auto; margin: 0; font-family: var(--font-mono); font-size: 13px;
  }

  .markdown-content :global(code) {
    font-family: var(--font-mono); font-size: 0.9em;
  }

  .markdown-content :global(p) { margin: 4px 0; }
  .markdown-content :global(ul), .markdown-content :global(ol) { padding-left: 20px; margin: 4px 0; }
  .markdown-content :global(h1), .markdown-content :global(h2), .markdown-content :global(h3) { margin: 12px 0 4px; color: var(--text-primary); }
  .markdown-content :global(strong) { color: var(--text-primary); }
  .markdown-content :global(table) { border-collapse: collapse; width: 100%; margin: 8px 0; }
  .markdown-content :global(th), .markdown-content :global(td) { border: 1px solid var(--border-primary); padding: 6px 10px; text-align: left; font-size: 13px; }
  .markdown-content :global(th) { background: var(--bg-tertiary); font-weight: 600; }

  .artifact-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .save-artifact-btn {
    font-size: 11px; padding: 4px 10px; border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--accent-primary) 15%, transparent);
    color: var(--text-accent); border: 1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent);
    transition: all var(--transition-fast);
  }
  .save-artifact-btn:hover { background: color-mix(in srgb, var(--accent-primary) 25%, transparent); }
</style>
