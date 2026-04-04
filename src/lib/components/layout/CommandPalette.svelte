<script lang="ts">
  import Fuse from 'fuse.js';
  import { uiState } from '$lib/state/ui.svelte';
  import { phaseState } from '$lib/state/phase.svelte';
  import { COMMANDS, type PaletteCommand } from '$lib/constants/commands';
  import type { PhaseNumber } from '$lib/types/project';

  let query = $state('');
  let selectedIndex = $state(0);
  let inputEl = $state<HTMLInputElement>();

  $effect(() => {
    if (uiState.commandPaletteOpen && inputEl) {
      inputEl.focus();
    }
  });

  const fuse = new Fuse(COMMANDS, {
    keys: ['title', 'description', 'section'],
    threshold: 0.4
  });

  const results = $derived(
    query.trim()
      ? fuse.search(query).map((r) => r.item)
      : COMMANDS
  );

  function handleSelect(command: PaletteCommand) {
    uiState.commandPaletteOpen = false;
    query = '';
    executeCommand(command);
  }

  function executeCommand(cmd: PaletteCommand) {
    if (cmd.action.startsWith('phase:')) {
      const phase = parseInt(cmd.action.split(':')[1]) as PhaseNumber;
      phaseState.setCurrentPhase(phase);
    } else if (cmd.action === 'app:settings') {
      uiState.settingsOpen = true;
    } else if (cmd.action === 'view:sidebar') {
      uiState.toggleSidebar();
    } else if (cmd.action === 'view:context') {
      uiState.toggleContextPanel();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      uiState.commandPaletteOpen = false;
      query = '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  }
</script>

{#if uiState.commandPaletteOpen}
  <div class="palette-overlay" role="dialog" aria-modal="true" aria-label="Command Palette" tabindex="-1" onclick={() => { uiState.commandPaletteOpen = false; query = ''; }} onkeydown={(e) => { if (e.key === 'Escape') { uiState.commandPaletteOpen = false; query = ''; } }}>
    <div class="palette" role="presentation" onclick={(e) => e.stopPropagation()}>
      <input
        class="palette-input"
        bind:value={query}
        bind:this={inputEl}
        placeholder="Search commands..."
        onkeydown={handleKeydown}
      />
      <div class="palette-results">
        {#each results as command, i (command.id)}
          <button
            class="result-item"
            class:selected={i === selectedIndex}
            onclick={() => handleSelect(command)}
            onmouseenter={() => selectedIndex = i}
          >
            <div class="result-info">
              <span class="result-title">{command.title}</span>
              <span class="result-desc">{command.description}</span>
            </div>
            {#if command.shortcut}
              <span class="result-shortcut">{command.shortcut}</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .palette-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    display: flex; align-items: flex-start; justify-content: center;
    padding-top: 120px; z-index: 200; backdrop-filter: blur(4px);
  }
  .palette {
    width: 560px; background: var(--bg-surface); border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); overflow: hidden;
  }
  .palette-input {
    width: 100%; padding: 14px 16px; background: transparent; border: none;
    border-bottom: 1px solid var(--border-secondary); font-size: 15px;
    color: var(--text-primary); outline: none;
  }
  .palette-results { max-height: 360px; overflow-y: auto; padding: 4px; }
  .result-item {
    width: 100%; padding: 8px 12px; display: flex; justify-content: space-between;
    align-items: center; border-radius: var(--radius-md); text-align: left;
    transition: background var(--transition-fast);
  }
  .result-item:hover, .result-item.selected { background: var(--bg-hover); }
  .result-info { display: flex; flex-direction: column; }
  .result-title { font-size: 13px; font-weight: 500; color: var(--text-primary); }
  .result-desc { font-size: 11px; color: var(--text-tertiary); }
  .result-shortcut {
    font-size: 11px; color: var(--text-tertiary); background: var(--bg-tertiary);
    padding: 2px 6px; border-radius: var(--radius-sm); font-family: var(--font-mono);
  }
</style>
