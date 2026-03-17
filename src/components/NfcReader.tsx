'use client';

import { useState } from 'react';
import { readNfcUid } from '@/lib/nfc';

interface NfcReaderProps {
  onRead: (uid: string) => void;
  onError?: (error: string) => void;
}

export default function NfcReader({ onRead, onError }: NfcReaderProps) {
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    try {
      const uid = await readNfcUid();
      onRead(uid);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'NFC読み取りエラー');
    } finally {
      setScanning(false);
    }
  };

  return (
    <button
      onClick={handleScan}
      disabled={scanning}
      className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
    >
      {scanning ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          社員証を読み取ってください...
        </span>
      ) : (
        '社員証を読み取る (NFC)'
      )}
    </button>
  );
}
