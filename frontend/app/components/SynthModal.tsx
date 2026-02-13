'use client';

import { useState, useEffect } from 'react';
import saySomething, { getAvailableVoices } from './synth/synth.js';
import TextInput from './synth/TextInput';
import VoiceSelector from './synth/VoiceSelector';
import LanguageSelector from './synth/LanguageSelector';
import AudioControls from './synth/AudioControls';
import SpeakButton from './synth/SpeakButton';
import InfoBox from './synth/InfoBox';
import { useSynthSettings } from '../context';

interface SynthModalProps {
  onClose: () => void;
}

export function SynthModal({ onClose }: SynthModalProps) {
  const [text, setText] = useState('Hello, this is a speech synthesis demo!');
  const [voices, setVoices] = useState<any[]>([]);
  const { savedSettings, saveSettings } = useSynthSettings();
  const [selectedVoice, setSelectedVoice] = useState(savedSettings.selectedVoice);
  const [language, setLanguage] = useState(savedSettings.language);
  const [pitch, setPitch] = useState(savedSettings.pitch);
  const [rate, setRate] = useState(savedSettings.rate);
  const [volume, setVolume] = useState(savedSettings.volume);

  // Load available voices on mount
  useEffect(() => {
    const loadVoices = async () => {
      const availableVoices = await getAvailableVoices();
      setVoices(availableVoices);
    };

    loadVoices();
  }, []);

  useEffect(() => {
    setSelectedVoice(savedSettings.selectedVoice);
    setLanguage(savedSettings.language);
    setPitch(savedSettings.pitch);
    setRate(savedSettings.rate);
    setVolume(savedSettings.volume);
  }, [savedSettings]);

  // Update language when voice changes
  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName);
    if (voiceName) {
      const voice = voices.find((v) => v.name === voiceName);
      if (voice) {
        setLanguage(voice.lang);
      }
    }
  };

  // Handle speak
  const handleSpeak = () => {
    const options = {
      voiceName: selectedVoice,
      lang: language,
      pitch,
      rate,
      volume,
    };

    saySomething(text, options);
  };

  const handleSave = () => {
    saveSettings({
      selectedVoice,
      language,
      pitch,
      rate,
      volume,
    });
    onClose();
  };

  const isDirty =
    selectedVoice !== savedSettings.selectedVoice ||
    language !== savedSettings.language ||
    pitch !== savedSettings.pitch ||
    rate !== savedSettings.rate ||
    volume !== savedSettings.volume;

  return (
    <div className="bg-white rounded-lg p-6 max-h-[80vh] overflow-y-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">🗣️ Speech Synthesis</h2>

      <TextInput value={text} onChange={setText} onSpeak={handleSpeak} />

      <VoiceSelector value={selectedVoice} onChange={handleVoiceChange} voices={voices} />

      <LanguageSelector value={language} onChange={setLanguage} />

      <AudioControls
        pitch={pitch}
        rate={rate}
        volume={volume}
        onPitchChange={setPitch}
        onRateChange={setRate}
        onVolumeChange={setVolume}
      />

      <SpeakButton onClick={handleSpeak} />

      <button
        onClick={handleSave}
        disabled={!isDirty}
        className="w-full mt-3 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-md cursor-pointer transition active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        💾 Save Settings
      </button>

      <InfoBox />
    </div>
  );
}
