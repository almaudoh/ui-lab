// Types
export type AgentMessageType = 'human' | 'ai' | 'system';
export type AppMessageType = AgentMessageType | 'ui' | 'error';

export interface Message {
  id: number;
  content: string;
  type: AppMessageType;
  autoPlay?: boolean;
}

export interface Config {
  backendUrl: string;
  endpoint: string;
}
