// Types
export type LangChainMessageType = 'human' | 'ai' | 'system';

export interface Message {
  id: number;
  content: string;
  type: LangChainMessageType;
}

export interface Config {
  backendUrl: string;
  endpoint: string;
}
