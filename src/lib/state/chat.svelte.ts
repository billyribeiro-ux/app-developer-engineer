import type { Message, StreamChunk } from '$lib/types/message';
import type { TokenUsage } from '$lib/types/claude';

class ChatState {
  messages = $state<Message[]>([]);
  isStreaming = $state(false);
  currentStreamContent = $state('');
  tokenUsage = $state<TokenUsage>({ input_tokens: 0, output_tokens: 0 });

  setMessages(messages: Message[]) {
    this.messages = messages;
  }

  addMessage(message: Message) {
    this.messages = [...this.messages, message];
  }

  startStreaming() {
    this.isStreaming = true;
    this.currentStreamContent = '';
  }

  appendChunk(chunk: string) {
    this.currentStreamContent += chunk;
  }

  finishStreaming() {
    this.isStreaming = false;
    this.currentStreamContent = '';
  }

  setTokenUsage(usage: TokenUsage) {
    this.tokenUsage = usage;
  }

  clear() {
    this.messages = [];
    this.currentStreamContent = '';
    this.isStreaming = false;
  }
}

export const chatState = new ChatState();
