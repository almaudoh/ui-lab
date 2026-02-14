'use client';

import styles from './styles';
import { Message } from '../types';
import { SpeakControls } from './SpeakControls';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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

  const normalizeMathDelimiters = (content: string) => {
    return content
      .replace(/\\\[([\s\S]+?)\\\]/g, (_, formula) => `$$${formula}$$`)
      .replace(/\\\(([\s\S]+?)\\\)/g, (_, formula) => `$${formula}$`)
      .replace(/\[\s*(\\[\s\S]+?)\s*\]/g, (_, formula) => `$$${formula}$$`);
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
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            table: ({ children }) => (
              <table style={styles.markdownTable}>{children}</table>
            ),
            th: ({ children }) => (
              <th style={styles.markdownTh}>{children}</th>
            ),
            td: ({ children }) => (
              <td style={styles.markdownTd}>{children}</td>
            ),
            pre: ({ children }) => (
              <pre style={styles.markdownPre}>{children}</pre>
            ),
            code: ({ inline, children, ...props }) => (
              <code
                style={inline ? styles.markdownCodeInline : styles.markdownCodeBlock}
                {...props}
              >
                {children}
              </code>
            ),
            img: ({ alt = '', ...props }) => (
              <img alt={alt} style={styles.markdownImage} {...props} />
            ),
          }}
        >
          {normalizeMathDelimiters(getContent())}
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
