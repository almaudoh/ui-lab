'use client';

import { useState, useRef, useEffect } from 'react';
import { useSynthSettings } from './context';
import { Message, LangChainMessageType, Config } from './types';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { StatusBar } from './components/StatusBar';
import { ChatInput } from './components/ChatInput';
import { Modal } from './components/Modal';
import { SynthModal } from './components/SynthModal';
import { RecogModal } from './components/RecogModal';
import { defaultConfig } from './config';
import saySomething from './components/synth/synth';
import styles from './components/styles';

// Main Page Component
export default function Page() {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState({ message: '', type: 'info' as 'info' | 'success' | 'error' });
  const [isSending, setIsSending] = useState(false);
  const [activeModal, setActiveModal] = useState<'synth' | 'recog' | null>(null);
  const messageIdCounter = useRef(0);
  const { savedSettings } = useSynthSettings();

  const showStatus = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setStatus({ message, type });

    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        setStatus({ message: '', type: 'info' });
      }, 3000);
    }
  };

  const addMessage = (content: string, type: LangChainMessageType) => {
    const newMessage: Message = {
      id: messageIdCounter.current++,
      content,
      type,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const updateLastMessage = (content: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], content };
      return updated;
    });
  };

  const handleSendMessage = async (message: string) => {
    if (!message) {
      showStatus('Please enter a message', 'error');
      return;
    }

    // Add user message
    const msg = addMessage(message, 'human');
    setIsSending(true);

    try {
      showStatus('Connecting to backend...', 'info');

      // Construct the request payload
      console.log(messages);
      const payload = { input: { messages: [...messages, msg] } };

      // Build the full URL
      const fullUrl = new URL(config.endpoint, config.backendUrl).toString();

      // Make the streaming request
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} ${response.statusText}`);
      }

      showStatus('Streaming response...', 'info');

      // // Create initial assistant message
      // const assistantMessage = addMessage('', 'assistant');

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        // Parse JSON lines if the backend sends NDJSON
        const lines = fullResponse.split('\n');

        // Keep the last incomplete line for next iteration
        fullResponse = lines[lines.length - 1];

        // Process complete lines
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          try {
            const data = JSON.parse(line);
            console.log('Received chunk:', line);
            console.log('Parsed chunk:', data);

            // Handle different response formats
            let text = '';
            if (typeof data === 'string') {
              text = data;
            } else if (data.output) {
              text = typeof data.output === 'string' ? data.output : JSON.stringify(data.output);
            } else if (data.text) {
              text = data.text;
            } else if (data.content) {
              text = data.content;
            } else {
              text = JSON.stringify(data);
            }

            if (text) {
              accumulatedText += text;
              updateLastMessage(accumulatedText);
            }
          } catch (e) {
            // If not JSON, treat as plain text
            if (line) {
              accumulatedText += line;
              updateLastMessage(accumulatedText);
            }
          }
        }
      }

      // Handle any remaining content
      if (fullResponse.trim()) {
        try {
          const data = JSON.parse(fullResponse);
          let text = '';
          if (typeof data === 'string') {
            text = data;
          } else if (data.output) {
            text = typeof data.output === 'string' ? data.output : JSON.stringify(data.output);
          } else if (data.text) {
            text = data.text;
          } else if (data.content) {
            text = data.content;
          }
          if (text) {
            accumulatedText += text;
            updateLastMessage(accumulatedText);
          }
        } catch (e) {
          if (fullResponse.trim()) {
            accumulatedText += fullResponse;
            updateLastMessage(accumulatedText);
          }
        }
      }
      
      // Speak the full message after completion.
      saySomething(accumulatedText, savedSettings);

      showStatus('Response received', 'success');
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addMessage(`Error: ${errorMessage}`, 'ai');
      showStatus(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleClearMessages = () => {
    setMessages([]);
    setStatus({ message: '', type: 'info' });
  };

  useEffect(() => {
    showStatus('Ready to chat', 'success');
  }, []);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <Header 
          onOpenSynth={() => setActiveModal('synth')}
          onOpenRecog={() => setActiveModal('recog')}
        />
        <MessageList messages={messages} />
        <ChatInput onSend={handleSendMessage} onClear={handleClearMessages} disabled={isSending} />
        <StatusBar status={status.message} type={status.type} />
      </div>

      <Modal isOpen={activeModal === 'synth'} onClose={() => setActiveModal(null)}>
        <SynthModal onClose={() => setActiveModal(null)} />
      </Modal>

      <Modal isOpen={activeModal === 'recog'} onClose={() => setActiveModal(null)}>
        <RecogModal onClose={() => setActiveModal(null)} />
      </Modal>
    </div>
  );
}
