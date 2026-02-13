'use client';

import { useRouter } from 'next/navigation';
import { RecogModal } from '../components/RecogModal';

export default function SpeechRecognitionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-5">
      <div className="max-w-2xl mx-auto">
        <RecogModal onClose={() => router.push('/')} />
      </div>
    </div>
  );
}
