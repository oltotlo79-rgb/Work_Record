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
    } catch {
      setError('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="flex min-h-screen flex-col items-center px-4 pt-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="text-4xl mb-2">&#10003;</div>
            <h2 className="text-xl font-bold text-green-800">登録完了</h2>
            <p className="mt-1 text-sm text-gray-600">
              {registered.name}（{registered.employee_number}）
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-6">
            <p className="mb-4 text-center text-sm font-medium text-gray-700">
              iPhoneでの打刻用QRコード
            </p>
            <QrCodeDisplay value={registered.nfc_uid} label={registered.employee_number} />
          </div>

          <button
            onClick={() => {
              setRegistered(null);
              setEmployeeNumber('');
              setName('');
              setNfcUid('');
            }}
            className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
          >
            続けて登録
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold">メンバー登録</h1>
          <div className="w-10" />
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">従業員番号</label>
            <input
              type="text"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              placeholder="例: 001"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">氏名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 山田太郎"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">NFC カードUID</label>
            {nfcAvailable ? (
              <div className="space-y-2">
                {nfcUid ? (
                  <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                    <p className="text-sm text-green-800">
                      読み取り済み: <span className="font-mono font-bold">{nfcUid}</span>
                    </p>
                  </div>
                ) : (
                  <NfcReader onRead={setNfcUid} onError={setError} />
                )}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={nfcUid}
                  onChange={(e) => setNfcUid(e.target.value.toUpperCase())}
                  placeholder="UIDを手動入力"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  NFC非対応デバイスのため手動入力してください
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !employeeNumber || !name || !nfcUid}
            className="w-full rounded-xl bg-green-600 py-3 text-lg font-semibold text-white transition-colors hover:bg-green-700 disabled:bg-green-400"
          >
            {loading ? '登録中...' : '登録する'}
          </button>
        </form>
      </div>
    </div>
  );
}
