'use client';

import { useRef, useEffect, useState } from 'react';
import styles from './styles';
import { type Message } from '../types';
import { MessageComponent } from './Message';

export function MessageList({ messages }: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={messagesContainerRef} style={styles.messages}>
      {messages.map((message) => (
        <MessageComponent
          key={message.id}
          message={message}
          isSpeaking={speakingMessageId === message.id}
          onSpeakStart={(messageId) => setSpeakingMessageId(messageId)}
          onSpeakEnd={() => setSpeakingMessageId(null)}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
