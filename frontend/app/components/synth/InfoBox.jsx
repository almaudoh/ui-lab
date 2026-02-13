'use client';

export default function InfoBox() {
  return (
    <div className="mt-5 p-3 bg-blue-50 border-l-4 border-blue-500 text-sm text-gray-700">
      <strong>Tip:</strong> When you select a specific voice, it will use that voice's native language for best quality
      (the Language dropdown is only used with "Default Voice"). Adjust pitch, rate, and volume to customize the speech
      further.
    </div>
  );
}
