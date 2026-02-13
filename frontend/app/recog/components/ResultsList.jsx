'use client';

export default function ResultsList({ results }) {
  return (
    <div className="bg-gray-50 p-5 rounded-md mb-5">
      <div className="font-bold text-gray-700 mb-2 text-sm">All Recognized Phrases</div>
      <div className="max-h-[300px] overflow-y-auto bg-white p-2 rounded-md">
        {results.length === 0 ? (
          <p className="text-gray-400">No results yet. Start listening to see recognized phrases.</p>
        ) : (
          results.map((result, index) => (
            <div
              key={index}
              className={`p-2 mb-2 rounded border-l-3 ${
                result.isFinal
                  ? 'border-l-green-500 bg-green-50'
                  : 'border-l-blue-500 bg-gray-50'
              }`}
            >
              <strong>#{results.length - index}</strong> {result.transcript}
              <div className="text-sm text-gray-600 mt-1">
                Confidence: {Math.round(result.confidence * 100)}%
              </div>
              <div className="text-xs text-gray-400 mt-1">{result.time}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
