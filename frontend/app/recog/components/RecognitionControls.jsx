'use client';

export default function RecognitionControls({ 
  isListening, 
  onStart, 
  onStop, 
  onClear,
  disabled = false 
}) {
  return (
    <div className="flex gap-2 mb-5">
      <button
        onClick={onStart}
        disabled={disabled || isListening}
        className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-md text-base font-bold transition-colors hover:bg-blue-600 active:translate-y-px disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        🎙️ Start Listening
      </button>
      <button
        onClick={onStop}
        disabled={!isListening}
        className="flex-1 px-4 py-3 bg-red-500 text-white rounded-md text-base font-bold transition-colors hover:bg-red-600 active:translate-y-px disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        ⏹️ Stop
      </button>
      <button
        onClick={onClear}
        className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-md text-base font-bold transition-colors hover:bg-blue-600 active:translate-y-px disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        🗑️ Clear
      </button>
    </div>
  );
}
