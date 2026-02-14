'use client';

import styles from './styles';
import { Message } from '../types';
import { SpeakControls } from './SpeakControls';

export function MessageComponent({ message }: { message: Message }) {
  const isUser = message.type === 'human';
  const isAi = message.type === 'ai';
  const isSystem = message.type === 'system';
  const isUi = message.type === 'ui';
  const isError = message.type === 'error';

  const formatContent = (content: unknown) => {
    // Ensure content is a string
    const contentStr = typeof content === 'string' ? content : String(content || '');
    return contentStr
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  const messageStyle = {
    ...styles.message,
    ...(isUser ? styles.messageUser : {}),
  };

  const contentStyle = {
    ...styles.messageContent,
    ...(isUser ? styles.messageContentUser : {}),
    ...(isAi ? styles.messageContentAi : {}),
    ...(isSystem ? styles.messageContentSystem : {}),
    ...(isUi ? styles.messageContentUi : {}),
    ...(isError ? styles.messageContentError : {}),
  };

  return (
    <div style={messageStyle}>
      <div
        style={contentStyle}
        dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
      />
      {isAi && <SpeakControls text={message.content} />}
    </div>
  );
}
