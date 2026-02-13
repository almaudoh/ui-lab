'use client';

export default function SpeakButton({ onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-md cursor-pointer transition active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      🔊 Speak
    </button>
  );
}
