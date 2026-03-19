'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isNfcSupported } from '@/lib/nfc';
import NfcReader from '@/components/NfcReader';
import QrCodeDisplay from '@/components/QrCodeDisplay';
import type { Employee } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [name, setName] = useState('');
  const [nfcUid, setNfcUid] = useState('');
  const [nfcAvailable, setNfcAvailable] = useState<boolean | null>(null);
  const [registered, setRegistered] = useState<Employee | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNfcAvailable(isNfcSupported());
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_number: employeeNumber,
          name,
          nfc_uid: nfcUid,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setRegistered(data);

      // adminでログイン中の場合、登録した従業員番号でログインし直すよう促す
      const viewerId = document.cookie.match(/(?:^|; )employee_number=([^;]*)/);
      const currentUser = viewerId ? decodeURIComponent(viewerId[1]) : '';
      if (currentUser === 'admin') {
        const ok = window.confirm('登録した従業員番号でログインし直してください。');
        if (ok) {
          await fetch('/api/auth/login', { method: 'DELETE' });
          router.push('/login');
          return;
        }
      }
    } catch {
      setError('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="flex min-h-screen flex-col items-center p-6 pt-12 sm:pt-16">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass-panel rounded-[2rem] p-10 space-y-8 text-center border-emerald-500/20">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-emerald-400">登録完了</h2>
              <p className="text-slate-300 font-medium">
                {registered.name} <span className="text-slate-500 text-sm">#{registered.employee_number}</span>
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 border-white/5">
              <p className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                iPhone用打刻QRコード
              </p>
              <div className="flex justify-center p-2 bg-white rounded-xl">
                <QrCodeDisplay value={registered.nfc_uid} label={registered.employee_number} />
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setRegistered(null);
                  setEmployeeNumber('');
                  setName('');
                  setNfcUid('');
                }}
                className="btn-premium w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all"
              >
                続けて登録
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-bold text-slate-400 hover:text-white transition-all"
              >
                ホームに戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-6 pt-12 sm:pt-16">
      <div className="w-full max-w-md space-y-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="group glass-card rounded-2xl p-3 text-slate-400 hover:text-white border-white/5"
          >
            <svg className="h-6 w-6 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-gradient">メンバー登録</h1>
          <div className="w-12" />
        </div>

        <div className="glass-panel rounded-[2rem] p-8 space-y-8">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="ml-1 text-sm font-bold text-slate-400 tracking-wide uppercase">従業員番号</label>
              <input
                type="text"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                placeholder="例: 001"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-lg text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-sm font-bold text-slate-400 tracking-wide uppercase">氏名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 山田太郎"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-lg text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-sm font-bold text-slate-400 tracking-wide uppercase">NFC カードUID</label>
              {nfcAvailable ? (
                <div className="space-y-4">
                  {nfcUid ? (
                    <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-6 py-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest">UID Identified</p>
                        <p className="font-mono text-lg font-bold text-emerald-400 tracking-tighter">{nfcUid}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setNfcUid('')}
                        className="text-slate-400 hover:text-white p-2"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="glass-card rounded-2xl p-2 border-white/5 overflow-hidden">
                      <NfcReader onRead={setNfcUid} onError={setError} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={nfcUid}
                    onChange={(e) => setNfcUid(e.target.value.toUpperCase())}
                    placeholder="UIDを手動入力"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-mono text-lg text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none transition-all"
                    required
                  />
                  <p className="ml-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Manual entry active (NFC unavailable)
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-center text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !employeeNumber || !name || !nfcUid}
              className="btn-premium w-full rounded-2xl bg-emerald-600 py-4 text-lg font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  登録中...
                </span>
              ) : '登録する'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
