'use client';

export default function TextInput({ value, onChange, onSpeak }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSpeak();
    }
  };

  return (
    <div className="mb-5">
      <label htmlFor="textInput" className="block mb-2 font-bold text-gray-700">
        Text to Speak:
      </label>
      <input
        type="text"
        id="textInput"
        placeholder="Type something..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
