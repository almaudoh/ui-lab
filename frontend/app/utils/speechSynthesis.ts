'use client';

import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import saySomething from '../components/synth/synth';
import { markdownToSpeechText } from './markdown';
import { SynthSettings } from '../context/settings';

export interface PlaybackState {
  isPaused: boolean;
  chunks: string[];
  chunkIndex: number;
  chunkOffset: number;
  lastBoundaryOffset: number;
  utteranceId: number;
  isManualPause: boolean;
}

export interface SpeechSynthesisCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onBoundary?: (event: SpeechSynthesisEvent) => void;
}

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 800,
  chunkOverlap: 80,
  keepSeparator: true,
  separators: ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' ', ''],
});

function createPlayChunk(
  playbackState: PlaybackState,
  synthSettings: SynthSettings,
  callbacks: SpeechSynthesisCallbacks = {}
): (chunkIndex: number, startOffset?: number) => void {
  return function playChunk(chunkIndex: number, startOffset = 0) {
    const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
    if (!canSpeak || playbackState.isPaused) {
      return;
    }

    const currentUtteranceId = playbackState.utteranceId;
    const chunk = playbackState.chunks[chunkIndex] || '';
    if (!chunk.trim()) {
      return;
    }

    playbackState.isManualPause = false;
    playbackState.chunkIndex = chunkIndex;
    playbackState.chunkOffset = startOffset;
    // Note: Web Speech API's charIndex in onboundary is unreliable (often always 0)
    // so we can only reliably resume from chunk boundaries, not mid-chunk

    window.speechSynthesis.cancel();

    saySomething(chunk.slice(startOffset), {
      voiceName: synthSettings.selectedVoice,
      lang: synthSettings.language,
      pitch: synthSettings.pitch,
      rate: synthSettings.rate,
      volume: synthSettings.volume,
      onBoundary: (event: SpeechSynthesisEvent) => {
        if (playbackState.utteranceId !== currentUtteranceId) {
          return;
        }

        // Store boundary info even though charIndex is often unreliable
        if (typeof event.charIndex === 'number' && event.charIndex > 0) {
          playbackState.lastBoundaryOffset = startOffset + event.charIndex;
        }

        callbacks.onBoundary?.(event);
      },
      onEnd: () => {
        if (playbackState.utteranceId !== currentUtteranceId) {
          return;
        }

        if (playbackState.isManualPause || playbackState.isPaused) {
          playbackState.isManualPause = false;
          return;
        }

        const nextIndex = chunkIndex + 1;
        if (nextIndex < playbackState.chunks.length) {
          if (!playbackState.isPaused) {
            playChunk(nextIndex, 0);
          }
          return;
        }

        callbacks.onEnd?.();
      },
      onError: () => {
        if (playbackState.utteranceId !== currentUtteranceId) {
          return;
        }

        // Don't call error callback if this was a manual pause
        if (playbackState.isManualPause || playbackState.isPaused) {
          playbackState.isManualPause = false;
          return;
        }

        playbackState.isManualPause = false;
        callbacks.onError?.();
      },
    });
  };
}

export async function speakTextWithControls(
  text: unknown,
  synthSettings: SynthSettings,
  callbacks: SpeechSynthesisCallbacks = {},
  playbackState: PlaybackState = {
    isPaused: false,
    chunks: [],
    chunkIndex: 0,
    chunkOffset: 0,
    lastBoundaryOffset: 0,
    utteranceId: 0,
    isManualPause: false,
  }
): Promise<PlaybackState> {
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
  if (!canSpeak) {
    return playbackState;
  }

  const rawText = typeof text === 'string' ? text : String(text || '');
  const textToSpeak = markdownToSpeechText(rawText);

  console.log('[speech] textToSpeak', textToSpeak);

  if (!textToSpeak.trim()) {
    callbacks.onEnd?.();
    return playbackState;
  }

  const utteranceId = playbackState.utteranceId + 1;
  playbackState.utteranceId = utteranceId;
  playbackState.isManualPause = false;

  window.speechSynthesis.cancel();
  callbacks.onStart?.();

  const chunks = await textSplitter.splitText(textToSpeak);

  // Bail if another speak request came in while splitting.
  if (playbackState.utteranceId !== utteranceId) {
    return playbackState;
  }

  const cleanedChunks = chunks.map((chunk) => chunk.trim()).filter(Boolean);
  if (!cleanedChunks.length) {
    callbacks.onEnd?.();
    return playbackState;
  }

  playbackState.chunks = cleanedChunks;
  playbackState.chunkIndex = 0;
  playbackState.chunkOffset = 0;
  playbackState.lastBoundaryOffset = 0;
  playbackState.isPaused = false;

  const playChunk = createPlayChunk(playbackState, synthSettings, callbacks);
  playChunk(0, 0);

  return playbackState;
}

export function resumePlayback(
  playbackState: PlaybackState,
  synthSettings: SynthSettings,
  callbacks: SpeechSynthesisCallbacks = {}
): void {
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
  if (!canSpeak || !playbackState.chunks.length) {
    return;
  }

  playbackState.isPaused = false;
  playbackState.isManualPause = false;
  
  // Due to Web Speech API limitations (charIndex in onboundary is unreliable),
  // we resume from the start of the current chunk rather than mid-chunk
  const resumeOffset = 0;
  
  callbacks.onResume?.();

  const playChunk = createPlayChunk(playbackState, synthSettings, callbacks);
  playChunk(playbackState.chunkIndex, resumeOffset);
}

export function pauseSpeech(playbackState: PlaybackState) {
  playbackState.isManualPause = true;
  playbackState.isPaused = true;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function cancelSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
