'use client';

import styles from './styles';
import { Message } from '../types';
import { SpeakControls } from './SpeakControls';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MessageComponent({
  message,
  isSpeaking = false,
  onSpeakStart,
  onSpeakEnd,
}: {
  message: Message;
  isSpeaking?: boolean;
  onSpeakStart?: (messageId: number) => void;
  onSpeakEnd?: () => void;
}) {
  const isUser = message.type === 'human';
  const isAi = message.type === 'ai';
  const isSystem = message.type === 'system';
  const isUi = message.type === 'ui';
  const isError = message.type === 'error';

  const getContent = () => {
    return typeof message.content === 'string' ? message.content : String(message.content || '');
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
      <div style={contentStyle}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {getContent()}
        </ReactMarkdown>
      </div>
      {isAi && (
        <SpeakControls
          text={message.content}
          autoPlay={message.autoPlay}
          isSpeaking={isSpeaking}
          onSpeakStart={() => onSpeakStart?.(message.id)}
          onSpeakEnd={onSpeakEnd}
        />
      )}
    </div>
  );
}
