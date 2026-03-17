'use client';

import { useRouter } from 'next/navigation';
import NfcWarning from '@/components/NfcWarning';

export default function HomePage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">打刻記録システム</h1>
        </div>

        <NfcWarning />

        <div className="space-y-3">
          <button
            onClick={() => router.push('/attendance')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            打刻記録
          </button>

          <button
            onClick={() => router.push('/register')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-green-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            メンバー登録
          </button>

          <button
            onClick={() => router.push('/records')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-purple-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            打刻確認
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
