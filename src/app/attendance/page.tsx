'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ToggleSwitch from '@/components/ToggleSwitch';
import CardReader from '@/components/CardReader';
import type { Employee } from '@/types';

export default function AttendancePage() {
  const router = useRouter();
  const [type, setType] = useState<'clock_in' | 'clock_out'>('clock_in');
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'idle';
    message: string;
    employee?: Employee;
  }>({ type: 'idle', message: '' });
  const [processing, setProcessing] = useState(false);

  const handleRead = useCallback(async (uid: string) => {
    if (processing) return;
    setProcessing(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const empRes = await fetch(`/api/employees/${encodeURIComponent(uid)}`);
      const empData = await empRes.json();

      if (!empRes.ok) {
        setStatus({ type: 'error', message: empData.error || '未登録のカードです' });
        return;
      }

      const attRes = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: empData.id, type }),
      });
      const attData = await attRes.json();

      if (!attRes.ok) {
        setStatus({ type: 'error', message: attData.error || '打刻に失敗しました' });
        return;
      }

      setStatus({
        type: 'success',
        message: type === 'clock_in' ? '始業を記録しました' : '終業を記録しました',
        employee: empData,
      });

      setTimeout(() => {
        setStatus({ type: 'idle', message: '' });
      }, 3000);
    } catch {
      setStatus({ type: 'error', message: '通信エラーが発生しました' });
    } finally {
      setProcessing(false);
    }
  }, [type, processing]);

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
          <h1 className="text-2xl font-bold tracking-tight text-gradient">打刻記録</h1>
          <div className="w-12" />
        </div>

        <div className="glass-panel rounded-3xl p-6 space-y-8">
          <div className="flex justify-center">
            <ToggleSwitch value={type} onChange={setType} />
          </div>

          <div className="relative min-h-[300px] flex items-center justify-center">
            {/* Status Display */}
            {status.type === 'success' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                <div className="h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                  <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xl font-bold text-emerald-400">{status.message}</p>
                {status.employee && (
                  <p className="mt-2 text-slate-300 font-medium">
                    {status.employee.name}
                  </p>
                )}
              </div>
            )}

            {status.type === 'error' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                <div className="h-20 w-20 rounded-full bg-red-500 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                  <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-xl font-bold text-red-400">{status.message}</p>
              </div>
            )}

            {processing && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
                <svg className="h-16 w-16 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="mt-4 text-blue-400 font-bold">処理中...</p>
              </div>
            )}

            {!processing && status.type === 'idle' && (
              <div className="w-full">
                <CardReader onRead={handleRead} active={!processing} />
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm">
          NFCまたはQRコードをスキャンしてください
        </p>
      </div>
    </div>
  );
}
