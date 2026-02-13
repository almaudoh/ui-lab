'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import saySomething, { getAvailableVoices } from './synth.js';
import TextInput from './components/TextInput';
import VoiceSelector from './components/VoiceSelector';
import LanguageSelector from './components/LanguageSelector';
import AudioControls from './components/AudioControls';
import SpeakButton from './components/SpeakButton';
import InfoBox from './components/InfoBox';
import { useSynthSettings } from '../context';

export default function SynthPage() {
  const router = useRouter();
  const [text, setText] = useState('Hello, this is a speech synthesis demo!');
  const [voices, setVoices] = useState([]);
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
  const handleVoiceChange = (voiceName) => {
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
    router.push('/');
  };

  const isDirty =
    selectedVoice !== savedSettings.selectedVoice ||
    language !== savedSettings.language ||
    pitch !== savedSettings.pitch ||
    rate !== savedSettings.rate ||
    volume !== savedSettings.volume;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">🗣️ Speech Synthesis Demo</h1>

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
    </div>
  );
}
