import styles from "./styles";
import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";

export function ChatInput({
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
