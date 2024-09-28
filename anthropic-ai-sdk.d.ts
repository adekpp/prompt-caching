declare module '@anthropic-ai/sdk' {
  export default class Anthropic {
    constructor(options: { apiKey: string });
    messages: {
      create(params: MessageCreateParamsBase, options?: RequestOptions): Promise<Message>;
    };
  }

  export interface MessageCreateParamsBase {
    model: string;
    max_tokens: number;
    messages: Array<{
      role: string;
      content: Array<{
        type: string;
        text: string;
        cache_control?: { type: string };
      }>;
    }>;
    system?: Array<{
      type: string;
      text: string;
      cache_control?: { type: string };
    }>;
  }

  export interface RequestOptions {
    headers?: Record<string, string>;
  }

  export interface Message {
    id: string;
    type: string;
    role: string;
    content: Array<{
      type: string;
      text: string;
    }>;
    model: string;
    stop_reason: string | null;
    stop_sequence: string | null;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  }
}