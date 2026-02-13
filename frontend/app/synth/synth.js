const saySomething = (something, options = {}) => {
  const utterance = new SpeechSynthesisUtterance(something);
  
  // Set pitch (0 to 2, default 1)
  utterance.pitch = options.pitch || 1;
  
  // Set rate/speed (0.1 to 10, default 1)
  utterance.rate = options.rate || 1;
  
  // Set volume (0 to 1, default 1)
  utterance.volume = options.volume || 1;
  
  // Select a specific voice (if provided, use the voice's natural language)
  if (options.voiceName) {
    const voices = speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.name === options.voiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      // Use the voice's native language for best quality
      utterance.lang = selectedVoice.lang;
    } else {
      // Fallback to language setting if voice not found
      utterance.lang = options.lang || 'en-US';
    }
  } else {
    // No specific voice selected, use language setting
    utterance.lang = options.lang || 'en-US';
  }
  
  speechSynthesis.speak(utterance);
};

// Get available voices
const getAvailableVoices = () => {
  return new Promise((resolve) => {
    let voices = speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
    } else {
      speechSynthesis.onvoiceschanged = () => {
        voices = speechSynthesis.getVoices();
        resolve(voices);
      };
    }
  });
};

// Usage example:
// saySomething("Hello world", {
//   lang: 'en-US',
//   pitch: 1.2,
//   rate: 1.1,
//   volume: 0.9,
//   voiceName: 'Google US English'
// });

export default saySomething;
export { getAvailableVoices };
