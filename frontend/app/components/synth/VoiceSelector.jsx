'use client';

export default function VoiceSelector({ value, onChange, voices }) {
  return (
    <div className="mb-5">
      <label htmlFor="voiceSelect" className="block mb-2 font-bold text-gray-700">
        Voice:
      </label>
      <select
        id="voiceSelect"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Default Voice</option>
        {voices.map((voice) => (
          <option key={voice.name} value={voice.name}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>
    </div>
  );
}
