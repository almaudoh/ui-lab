'use client';

import { createContext, useContext, useState, useRef, useCallback, useMemo } from 'react';
import { Message, AgentMessageType, AppMessageType } from '../types';
import saySomething from '../components/synth/synth';
import { SynthSettings } from './settings';

interface StatusType {
  message: string;
  type: 'info' | 'success' | 'error';
}

interface MessageContextValue {
  messages: Message[];
  isSending: boolean;
  status: StatusType;
  handleSendMessage: (message: string, synthSettings: SynthSettings) => Promise<void>;
  handleClearMessages: () => void;
  showStatus: (message: string, type?: 'info' | 'success' | 'error') => void;
}

const MessageContext = createContext<MessageContextValue | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<StatusType>({ message: '', type: 'info' });
  const [isSending, setIsSending] = useState(false);
  const messageIdCounter = useRef(0);

  const showStatus = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setStatus({ message, type });

    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        setStatus({ message: '', type: 'info' });
      }, 3000);
    }
  }, []);

  const addMessage = useCallback((content: string, type: AppMessageType, id: number | null = null) => {
    const newMessage: Message = {
      id: id !== null ? id : messageIdCounter.current++,
      content,
      type,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  const isAgentMessageType = useCallback((type: AppMessageType): type is AgentMessageType =>
    type === 'human' || type === 'ai' || type === 'system', []);

  const buildAgentPayload = useCallback((allMessages: Message[]) =>
    allMessages.filter((msg) => isAgentMessageType(msg.type)), [isAgentMessageType]);

  const handleSendMessage = useCallback(async (message: string, synthSettings: SynthSettings) => {
    if (!message) {
      showStatus('Please enter a message', 'error');
      return;
    }

    // Add user message
    const msg = addMessage(message, 'human', messageIdCounter.current++);
    setIsSending(true);

    try {
      showStatus('Connecting to backend...', 'info');
      const sessionId = 'default-session';

      // Make the invoke request to the agent
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: buildAgentPayload([...messages, msg]),
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract the AI message content from the invoke response structure
      const aiMessage = data.output?.messages?.at(-1);
      const responseText = aiMessage?.content || '';

      // Add AI response as a new message
      addMessage(responseText, 'ai', messageIdCounter.current++);

      // Speak the response
      saySomething(responseText, synthSettings);
      showStatus('Response received', 'success');
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addMessage(`Error: ${errorMessage}`, 'error');
      showStatus(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsSending(false);
    }
  }, [messages, addMessage, showStatus, buildAgentPayload]);

  const handleClearMessages = useCallback(() => {
    setMessages([]);
    setStatus({ message: '', type: 'info' });
  }, []);

  const value = useMemo(
    () => ({
      messages,
      isSending,
      status,
      handleSendMessage,
      handleClearMessages,
      showStatus,
    }),
    [messages, isSending, status, handleSendMessage, handleClearMessages, showStatus]
  );

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
}
