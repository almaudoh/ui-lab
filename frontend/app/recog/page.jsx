'use client';

import { useState, useEffect, useRef } from 'react';
import RecognitionLanguageSelector from './components/RecognitionLanguageSelector';
import RecognitionControls from './components/RecognitionControls';
import StatusDisplay from './components/StatusDisplay';
import TranscriptDisplay from './components/TranscriptDisplay';
import ResultsList from './components/ResultsList';
import RecognitionInfoBox from './components/RecognitionInfoBox';

export default function SpeechRecognitionPage() {
  const [language, setLanguage] = useState('en-US');
  const [isListening, setIsListening] = useState(false);
  const [finalText, setFinalText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState({ message: '', type: '', show: false });
  const [browserSupport, setBrowserSupport] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setBrowserSupport(false);
      setStatus({
        message: 'Speech Recognition API is not supported in this browser. Please try Chrome, Edge, or Safari.',
        type: 'error',
        show: true
      });
      return;
    }

    // Initialize recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    // Handle results
    recognition.onresult = (event) => {
      let interim = '';
      let isFinal = false;
      let currentConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        currentConfidence = event.results[i][0].confidence || 0;

        if (event.results[i].isFinal) {
          isFinal = true;
          setFinalText(transcript);
          setInterimText('');

          // Add to results list
          const now = new Date();
          const timeStr = now.toLocaleTimeString();
          setResults((prev) => [
            ...prev,
            {
              transcript: transcript,
              confidence: currentConfidence,
              time: timeStr,
              isFinal: true
            }
          ]);
        } else {
          interim += transcript + ' ';
        }
      }

      // Update confidence display
      const confidencePercent = Math.round(currentConfidence * 100);
      setConfidence(confidencePercent);

      // Update interim results
      if (interim) {
        setInterimText(interim);
      }

      setStatus({
        message: isFinal ? 'Recognized!' : 'Listening...',
        type: isFinal ? 'processing' : 'listening',
        show: true
      });
    };

    // Handle errors
    recognition.onerror = (event) => {
      let errorMessage = 'Error: ';
      switch (event.error) {
        case 'network':
          errorMessage += 'Network error. Please check your connection.';
          break;
        case 'audio':
          errorMessage += 'Audio capture error. Check your microphone.';
          break;
        case 'not-allowed':
          errorMessage += 'Microphone access denied. Please grant permission.';
          break;
        case 'no-speech':
          errorMessage += 'No speech detected. Please try again.';
          break;
        default:
          errorMessage += event.error;
      }

      setStatus({ message: errorMessage, type: 'error', show: true });
      setIsListening(false);
    };

    // Handle end of recognition
    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      } else {
        setStatus({ message: '', type: '', show: false });
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, isListening]);

  const handleStart = () => {
    setIsListening(true);
    setResults([]);
    setFinalText('');
    setInterimText('');
    setConfidence(0);
    setStatus({ message: 'Listening...', type: 'listening', show: true });

    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
    }
  };

  const handleStop = () => {
    setIsListening(false);
    setStatus({ message: '', type: '', show: false });

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleClear = () => {
    setFinalText('');
    setInterimText('');
    setConfidence(0);
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-5">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-5">
          🎤 Speech Recognition Demo
        </h1>

        <RecognitionLanguageSelector 
          value={language} 
          onChange={setLanguage}
          disabled={isListening}
        />

        <StatusDisplay 
          message={status.message}
          type={status.type}
          show={status.show}
        />

        <RecognitionControls
          isListening={isListening}
          onStart={handleStart}
          onStop={handleStop}
          onClear={handleClear}
          disabled={!browserSupport}
        />

        <TranscriptDisplay
          finalText={finalText}
          interimText={interimText}
          confidence={confidence}
        />

        <ResultsList results={results} />

        <RecognitionInfoBox />
      </div>
    </div>
  );
}
