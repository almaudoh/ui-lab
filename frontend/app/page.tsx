'use client';

import { useState, useEffect } from 'react';
import { useSynthSettings } from './context/settings';
import { useMessages } from './context/message';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { StatusBar } from './components/StatusBar';
import { ChatInput } from './components/ChatInput';
import { Modal } from './components/Modal';
import { SynthModal } from './components/SynthModal';
import { RecogModal } from './components/RecogModal';
import styles from './components/styles';

// Main Page Component
export default function Page() {
  const [activeModal, setActiveModal] = useState<'synth' | 'recog' | null>(null);
  const { savedSettings } = useSynthSettings();
  const { messages, isSending, status, handleSendMessage, handleClearMessages, showStatus } = useMessages();

  useEffect(() => {
    showStatus('Ready to chat', 'success');
  }, [showStatus]);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <Header 
          onOpenSynth={() => setActiveModal('synth')}
          onOpenRecog={() => setActiveModal('recog')}
        />
        <MessageList messages={messages} />
        <ChatInput 
          onSend={(msg) => handleSendMessage(msg)} 
          onClear={handleClearMessages} 
          disabled={isSending} 
        />
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
