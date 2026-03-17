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
      // Look up employee by NFC UID
      const empRes = await fetch(`/api/employees/${encodeURIComponent(uid)}`);
      const empData = await empRes.json();

      if (!empRes.ok) {
        setStatus({ type: 'error', message: empData.error || '未登録のカードです' });
        return;
      }

      // Record attendance
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

      // Reset after 3 seconds
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
    <div className="flex min-h-screen flex-col items-center px-4 pt-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">打刻記録</h1>
          <div className="w-10" />
        </div>

        <ToggleSwitch value={type} onChange={setType} />

        {/* Status Display */}
        {status.type === 'success' && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
            <div className="text-2xl mb-1">&#10003;</div>
            <p className="text-lg font-bold text-green-800">{status.message}</p>
            {status.employee && (
              <p className="mt-1 text-sm text-green-600">
                {status.employee.name}（{status.employee.employee_number}）
              </p>
            )}
          </div>
        )}

        {status.type === 'error' && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
            <p className="text-lg font-bold text-red-800">{status.message}</p>
          </div>
        )}

        {processing && (
          <div className="py-4 text-center text-gray-500">
            <svg className="mx-auto h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="mt-2 text-sm">処理中...</p>
          </div>
        )}

        {!processing && status.type !== 'success' && (
          <CardReader onRead={handleRead} active={!processing} />
        )}
      </div>
    </div>
  );
}
