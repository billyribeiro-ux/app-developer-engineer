export interface ClaudeRequest {
  model: string;
  max_tokens: number;
  system: string;
  messages: ClaudeMessage[];
  stream: boolean;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  id: string;
  content: Array<{ type: string; text: string }>;
  model: string;
  usage: TokenUsage;
}

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
}
