'use client';

export default function StatusDisplay({ message, type, show }) {
  if (!show) return null;

  const statusClasses = {
    listening: 'bg-green-100 text-green-800 border-green-200',
    processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className={`p-4 rounded-md mb-5 font-bold text-center border ${statusClasses[type] || ''}`}>
      {message}
    </div>
  );
}
