'use client';

export default function RecognitionInfoBox() {
  return (
    <div className="mt-5 p-4 bg-blue-50 border-l-4 border-blue-500 text-sm text-gray-700 rounded">
      <strong className="text-blue-900">How to use:</strong>
      <ul className="mt-2 text-xs space-y-1 list-disc list-inside">
        <li>Select your language from the dropdown</li>
        <li>Click "Start Listening" and speak into your microphone</li>
        <li>The demo will recognize your speech in real-time</li>
        <li>Interim results appear in gray (still being processed)</li>
        <li>Final results are confirmed and added to the history</li>
        <li>Check the confidence score to see how certain the recognition is</li>
      </ul>
    </div>
  );
}
