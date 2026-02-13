'use client';

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import saySomething from './synth/synth';
import { useSynthSettings } from './context';

// Types
interface Message {
  id: number;
  content: string;
  role: 'user' | 'assistant' | 'system';
}

interface Config {
  backendUrl: string;
  endpoint: string;
  inputField: string;
}

// Header Component
function Header({ config, onUpdateUrl }: { config: Config; onUpdateUrl: (url: string) => void }) {
  const [urlInput, setUrlInput] = useState(config.backendUrl);

  const handleUpdate = () => {
    if (!urlInput.trim()) {
      alert('Please enter a valid URL');
      return;
    }
    onUpdateUrl(urlInput);
  };

  return (
    <div style={styles.header}>
      <h1 style={styles.headerTitle}>Demo Chat Interface</h1>
      <div style={styles.configSection}>
        <label htmlFor="backendUrl" style={styles.configLabel}>
          Backend URL:
        </label>
        <input
          type="text"
          id="backendUrl"
          placeholder="http://localhost:8000"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          style={styles.configInput}
        />
        <button onClick={handleUpdate} style={styles.configButton}>
          Update
        </button>
      </div>
    </div>
  );
}

// Message Component
function MessageComponent({ message }: { message: Message }) {
  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  const messageStyle = {
    ...styles.message,
    ...(message.role === 'user' ? styles.messageUser : {}),
  };

  const contentStyle = {
    ...styles.messageContent,
    ...(message.role === 'user' ? styles.messageContentUser : {}),
    ...(message.role === 'assistant' ? styles.messageContentAssistant : {}),
    ...(message.role === 'system' ? styles.messageContentSystem : {}),
  };

  return (
    <div style={messageStyle}>
      <div
        style={contentStyle}
        dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
      />
    </div>
  );
}

// MessageList Component
function MessageList({ messages }: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={styles.messages}>
      {messages.map((message) => (
        <MessageComponent key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

// ChatInput Component
function ChatInput({
  onSend,
  onClear,
  disabled,
}: {
  onSend: (message: string) => void;
  onClear: () => void;
  disabled: boolean;
}) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const message = input.trim();
    if (message) {
      onSend(message);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all messages?')) {
      onClear();
    }
  };

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  return (
    <div style={styles.inputSection}>
      <div style={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          placeholder="Type your message... (Shift+Enter for new line, Enter to send)"
          rows={1}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          style={styles.messageInput}
        />
        <button onClick={handleSend} disabled={disabled} style={styles.sendButton}>
          Send
        </button>
        <button onClick={handleClear} style={styles.clearButton}>
          Clear
        </button>
      </div>
    </div>
  );
}

// StatusBar Component
function StatusBar({ status, type }: { status: string; type: 'info' | 'success' | 'error' }) {
  if (!status) return null;

  const statusStyle = {
    ...styles.status,
    ...(type === 'error' ? styles.statusError : {}),
  };

  return <div style={statusStyle}>{status}</div>;
}

// Main Page Component
export default function Page() {
  const [config, setConfig] = useState<Config>({
    backendUrl: 'http://localhost:8000',
    endpoint: '/agent/stream',
    inputField: 'input',
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState({ message: '', type: 'info' as 'info' | 'success' | 'error' });
  const [isSending, setIsSending] = useState(false);
  const messageIdCounter = useRef(0);

  const showStatus = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setStatus({ message, type });

    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        setStatus({ message: '', type: 'info' });
      }, 3000);
    }
  };

  const addMessage = (content: string, role: 'user' | 'assistant' | 'system') => {
    const newMessage: Message = {
      id: messageIdCounter.current++,
      content,
      role,
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

  const handleUpdateUrl = (url: string) => {
    setConfig((prev) => ({ ...prev, backendUrl: url }));
    showStatus(`Backend URL updated to: ${url}`, 'success');
  };

  const handleSendMessage = async (message: string) => {
    if (!message) {
      showStatus('Please enter a message', 'error');
      return;
    }

    // Add user message
    addMessage(message, 'user');
    setIsSending(true);

    try {
      showStatus('Connecting to backend...', 'info');

      // Construct the request payload
      const payload = {
        input: {
          [config.inputField]: message,
        },
      };

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
      const { savedSettings } = useSynthSettings();
      saySomething(accumulatedText, savedSettings);

      showStatus('Response received', 'success');
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addMessage(`Error: ${errorMessage}`, 'system');
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
        <Header config={config} onUpdateUrl={handleUpdateUrl} />
        <MessageList messages={messages} />
        <ChatInput onSend={handleSendMessage} onClear={handleClearMessages} disabled={isSending} />
        <StatusBar status={status.message} type={status.type} />
      </div>
    </div>
  );
}

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    background: 'linear-gradient(135deg, #adb9f2 0%, #f8f8f8 100%)',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  container: {
    width: '100%',
    maxWidth: '900px',
    height: '90vh',
    maxHeight: '800px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #5060db 100%)',
    color: 'white',
    padding: '20px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: '24px',
    marginBottom: '12px',
    margin: 0,
  },
  configSection: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  configLabel: {
    fontSize: '13px',
    opacity: 0.9,
  },
  configInput: {
    padding: '6px 10px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    fontSize: '12px',
    width: '300px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
  },
  configButton: {
    padding: '6px 12px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    background: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  message: {
    display: 'flex',
    gap: '8px',
    animation: 'slideIn 0.3s ease-out',
  },
  messageUser: {
    justifyContent: 'flex-end',
  },
  messageContent: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '12px',
    wordWrap: 'break-word',
    lineHeight: '1.4',
    fontSize: '14px',
  },
  messageContentUser: {
    background: 'linear-gradient(135deg, #76cba5 0%, #b9e7d4 100%)',
    color: 'white',
    borderBottomRightRadius: '4px',
  },
  messageContentAssistant: {
    background: '#e9ecef',
    color: '#222',
    borderBottomLeftRadius: '4px',
  },
  messageContentSystem: {
    background: '#fff3cd',
    color: '#856404',
    borderBottomLeftRadius: '4px',
    fontSize: '12px',
    alignSelf: 'center',
    maxWidth: '90%',
    textAlign: 'center',
  },
  inputSection: {
    padding: '20px',
    background: 'white',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    gap: '10px',
  },
  inputWrapper: {
    flex: 1,
    display: 'flex',
    gap: '8px',
  },
  messageInput: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'none',
    maxHeight: '100px',
    transition: 'all 0.2s',
  },
  sendButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #5163b3 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  clearButton: {
    padding: '12px 16px',
    background: '#f0f0f0',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  status: {
    fontSize: '12px',
    color: '#666',
    padding: '0 16px',
    marginTop: '8px',
  },
  statusError: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '8px',
    borderLeft: '4px solid #f5c6cb',
  },
};
