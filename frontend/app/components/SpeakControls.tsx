'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import styles from './styles';
import { useSynthSettings } from '../context/settings';
import { speakTextWithControls, pauseSpeech, resumePlayback, PlaybackState, SpeechSynthesisCallbacks } from '../utils/speechSynthesis';

type SpeakControlsProps = {
  text: unknown;
  autoPlay?: boolean;
  isSpeaking?: boolean;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
};

export function SpeakControls({ text, autoPlay = false, isSpeaking: isExternallySpeaking = false, onSpeakStart, onSpeakEnd }: SpeakControlsProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const playbackRef = useRef<PlaybackState>({
    isPaused: false,
    chunks: [] as string[],
    chunkIndex: 0,
    chunkOffset: 0,
    lastBoundaryOffset: 0,
    utteranceId: 0,
    isManualPause: false,
  });
  const autoPlayRef = useRef(false);
  const { savedSettings } = useSynthSettings();

  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const callbacks = useMemo<SpeechSynthesisCallbacks>(
    () => ({
      onStart: () => {
        setIsSpeaking(true);
        setIsPaused(false);
        onSpeakStart?.();
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsPaused(false);
        onSpeakEnd?.();
      },
      onError: () => {
        setIsSpeaking(false);
        setIsPaused(false);
        onSpeakEnd?.();
      },
      onPause: () => {
        setIsPaused(true);
      },
      onResume: () => {
        setIsSpeaking(true);
        setIsPaused(false);
      },
    }),
    [onSpeakStart, onSpeakEnd]
  );

  // Auto-play on mount if enabled
  useEffect(() => {
    if (autoPlay && !autoPlayRef.current && canSpeak) {
      autoPlayRef.current = true;
      speakTextWithControls(text, savedSettings, callbacks, playbackRef.current);
    }
  }, [autoPlay, canSpeak, text, savedSettings, callbacks]);

  const handleSpeak = async () => {
    await speakTextWithControls(text, savedSettings, callbacks, playbackRef.current);
  };

  const handlePauseResume = () => {
    if (!canSpeak || !isSpeaking) {
      return;
    }

    if (isPaused) {
      // Resume playback - onResume callback will update state
      resumePlayback(playbackRef.current, savedSettings, callbacks);
      return;
    }

    pauseSpeech(playbackRef.current);
    setIsPaused(true);
  };

  return (
    <div style={styles.speakControls}>
      <button
        type="button"
        style={{
          ...styles.speakButton,
          ...(isPaused ? styles.speakButtonDim : {}),
          ...(isExternallySpeaking ? {
            boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)',
            borderColor: 'rgba(239, 68, 68, 0.4)',
          } : {}),
        }}
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
          ...(isPaused ? {
            boxShadow: '0 0 12px rgba(251, 146, 60, 0.6)',
            borderColor: 'rgba(251, 146, 60, 0.4)',
          } : {}),
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
