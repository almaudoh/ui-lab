'use client';

import ConfidenceMeter from './ConfidenceMeter';

export default function TranscriptDisplay({ finalText, interimText, confidence }) {
  return (
    <div className="bg-gray-50 p-5 rounded-md mb-5 min-h-[80px]">
      <div className="font-bold text-gray-700 mb-2 text-sm">Current Transcript</div>
      <div className="text-lg text-gray-800 mb-2 p-2 bg-white border-l-4 border-blue-500">
        <span>{finalText || 'Ready to listen...'}</span>
        {interimText && <span className="text-gray-400 italic"> {interimText}</span>}
      </div>
      <ConfidenceMeter confidence={confidence} />
    </div>
  );
}
