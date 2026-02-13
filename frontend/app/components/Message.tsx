'use client';

import styles from './styles';
import { Message } from '../types';

export function MessageComponent({ message }: { message: Message }) {
  const displayRole = message.type === 'human' ? 'user' : 'assistant';

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  const messageStyle = {
    ...styles.message,
    ...(displayRole === 'user' ? styles.messageUser : {}),
  };

  const contentStyle = {
    ...styles.messageContent,
    ...(displayRole === 'user' ? styles.messageContentUser : {}),
    ...(displayRole === 'assistant' ? styles.messageContentAssistant : {}),
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
