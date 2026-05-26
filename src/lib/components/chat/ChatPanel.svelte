<script lang="ts">
  import { onMount } from 'svelte';
  import MessageList from './MessageList.svelte';
  import ChatInput from './ChatInput.svelte';
  import StreamingIndicator from './StreamingIndicator.svelte';
  import SuggestedPrompts from './SuggestedPrompts.svelte';
  import TeamHuddle from './TeamHuddle.svelte';
  import { chatState } from '$lib/state/chat.svelte';
  import { phaseState } from '$lib/state/phase.svelte';
  import { projectState } from '$lib/state/project.svelte';
  import { uiState } from '$lib/state/ui.svelte';
  import { sendMessage, loadMessages } from '$lib/services/claude';
  import { CONSULTANTS } from '$lib/constants/consultants';

  const consultant = $derived(CONSULTANTS[phaseState.currentPhaseNumber]);

  onMount(async () => {
    if (projectState.currentProject) {
      await loadMessages(projectState.currentProject.id, phaseState.currentPhaseNumber);
    }
  });

  // Reload messages when phase changes
  $effect(() => {
    const project = projectState.currentProject;
    const phase = phaseState.currentPhaseNumber;
    if (project) {
      loadMessages(project.id, phase);
    }
  });

  async function handleSend(content: string) {
    if (!projectState.currentProject || chatState.isStreaming) return;
    await sendMessage(
      projectState.currentProject.id,
      phaseState.currentPhaseNumber,
      content
    );
  }
</script>

<div class="chat-panel">
  {#if uiState.huddleActive && uiState.huddleConsultantIds.length >= 2}
    <!-- Huddle chat mode takes over the full panel -->
    <TeamHuddle />
  {:else}
    {#if chatState.messages.length === 0 && !chatState.isStreaming}
      <SuggestedPrompts onselect={handleSend} />
    {:else}
      <MessageList />
    {/if}

    {#if chatState.isStreaming}
      <StreamingIndicator content={chatState.currentStreamContent} />
    {/if}

    <ChatInput
      onsend={handleSend}
      disabled={chatState.isStreaming}
      placeholder={`Ask ${consultant.name}...`}
    />
  {/if}
</div>

<style>
  .chat-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
