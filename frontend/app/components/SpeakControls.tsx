'use client';

import { useMemo, useRef, useState } from 'react';
import styles from './styles';
import saySomething from './synth/synth.js';
import { useSynthSettings } from '../context/settings';

type SpeakControlsProps = {
  text: unknown;
};

export function SpeakControls({ text }: SpeakControlsProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const activeTextRef = useRef('');
  const baseIndexRef = useRef(0);
  const lastBoundaryIndexRef = useRef(0);
  const utteranceIdRef = useRef(0);
  const isManualPauseRef = useRef(false);
  const { savedSettings } = useSynthSettings();

  const textToSpeak = useMemo(() => {
    return typeof text === 'string' ? text : String(text || '');
  }, [text]);

  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const startSpeech = (fullText: string, startIndex = 0) => {
    if (!canSpeak || !fullText.trim()) {
      return;
    }

    const utteranceId = utteranceIdRef.current + 1;
    utteranceIdRef.current = utteranceId;
    isManualPauseRef.current = false;
    activeTextRef.current = fullText;
    baseIndexRef.current = startIndex;
    lastBoundaryIndexRef.current = startIndex;

    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    setIsPaused(false);

    saySomething(fullText.slice(startIndex), {
      voiceName: savedSettings.selectedVoice,
      lang: savedSettings.language,
      pitch: savedSettings.pitch,
      rate: savedSettings.rate,
      volume: savedSettings.volume,
      onBoundary: (event: SpeechSynthesisEvent) => {
        if (utteranceIdRef.current !== utteranceId) {
          return;
        }

        if (typeof event.charIndex === 'number') {
          lastBoundaryIndexRef.current = baseIndexRef.current + event.charIndex;
        }
      },
      onEnd: () => {
        if (utteranceIdRef.current !== utteranceId) {
          return;
        }

        if (isManualPauseRef.current) {
          isManualPauseRef.current = false;
          return;
        }

        setIsSpeaking(false);
        setIsPaused(false);
      },
      onError: () => {
        if (utteranceIdRef.current !== utteranceId) {
          return;
        }

        isManualPauseRef.current = false;
        setIsSpeaking(false);
        setIsPaused(false);
      },
    });

  };

  const handleSpeak = () => {
    startSpeech(textToSpeak, 0);
  };

  const handlePauseResume = () => {
    if (!canSpeak || !isSpeaking) {
      return;
    }

    if (isPaused) {
      const resumeText = activeTextRef.current || textToSpeak;
      const resumeIndex = Math.min(lastBoundaryIndexRef.current, resumeText.length);
      startSpeech(resumeText, resumeIndex);
      return;
    }

    isManualPauseRef.current = true;
    setIsPaused(true);
    window.speechSynthesis.cancel();
  };

  return (
    <div style={styles.speakControls}>
      <button
        type="button"
        style={{ ...styles.speakButton, ...(isPaused ? styles.speakButtonDim : {}) }}
        onClick={handleSpeak}
        aria-label="Speak this message"
        title={canSpeak ? 'Speak this message' : 'Speech not supported'}
        disabled={!canSpeak}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="currentColor"
            d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a3.5 3.5 0 0 0-2.06-3.17v6.34A3.5 3.5 0 0 0 16.5 12zm0-7a1 1 0 0 0-1 1c0 .4.24.76.6.92A7.5 7.5 0 0 1 19 12a7.5 7.5 0 0 1-2.9 5.08 1 1 0 1 0 1.2 1.6A9.5 9.5 0 0 0 21 12a9.5 9.5 0 0 0-3.7-7.68 1 1 0 0 0-.8-.32z"
          />
        </svg>
      </button>
      <button
        type="button"
        style={{
          ...styles.speakButton,
          ...styles.speakButtonPause,
          ...(isPaused ? styles.speakButtonActive : {}),
        }}
        onClick={handlePauseResume}
        aria-label={isPaused ? 'Resume speaking' : 'Pause speaking'}
        title={isPaused ? 'Resume speaking' : 'Pause speaking'}
        disabled={!canSpeak || !isSpeaking}
      >
        {isPaused ? (
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            aria-hidden="true"
            focusable="false"
          >
            <path fill="currentColor" d="M8 5v14l11-7-11-7z" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            aria-hidden="true"
            focusable="false"
          >
            <rect x="6.5" y="5.5" width="4" height="13" rx="1" fill="currentColor" />
            <rect x="13.5" y="5.5" width="4" height="13" rx="1" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
}
