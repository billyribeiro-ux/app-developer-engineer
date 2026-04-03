<script lang="ts">
  import { tick } from 'svelte';
  import MessageBubble from './MessageBubble.svelte';
  import { chatState } from '$lib/state/chat.svelte';

  let scrollContainer: HTMLDivElement;

  $effect(() => {
    // Auto-scroll when messages change
    const _ = chatState.messages.length;
    tick().then(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    });
  });
</script>

<div class="message-list" bind:this={scrollContainer}>
  {#each chatState.messages as message (message.id)}
    <MessageBubble {message} />
  {/each}
</div>

<style>
  .message-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
