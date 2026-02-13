'use client';

import { useRouter } from 'next/navigation';
import { SynthModal } from '../components/SynthModal';

export default function SynthPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <SynthModal onClose={() => router.push('/')} />
      </div>
    </div>
  );
}
