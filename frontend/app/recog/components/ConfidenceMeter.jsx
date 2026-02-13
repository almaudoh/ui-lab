'use client';

export default function ConfidenceMeter({ confidence }) {
  return (
    <div className="text-sm text-gray-600 mt-2">
      <span>Confidence: <span id="confidencePercent">{confidence}</span>%</span>
      <div className="w-full h-1.5 bg-gray-300 rounded-full mt-1 overflow-hidden">
        <div 
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}
