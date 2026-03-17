'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_number: employeeNumber }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      router.push('/');
    } catch {
      setError('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="glass-panel rounded-[2rem] p-10 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="text-gradient">打刻記録システム</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm">Welcome Back</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={employeeNumber}
                  onChange={(e) => setEmployeeNumber(e.target.value)}
                  placeholder="従業員番号を入力（例: 001）"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center text-lg text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  autoFocus
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center text-sm text-red-400">
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !employeeNumber.trim()}
              className="btn-premium flex w-full items-center justify-center rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  認証中...
                </span>
              ) : 'ログイン'}
            </button>
          </form>
        </div>
        <p className="text-center text-slate-500 text-sm">
          Secured with NFC & QR Authentication
        </p>
      </div>
    </div>
  );
}
