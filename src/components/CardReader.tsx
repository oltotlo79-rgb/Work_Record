'use client';

import { useState, useEffect } from 'react';
import { isNfcSupported } from '@/lib/nfc';
import NfcReader from './NfcReader';
import QrScanner from './QrScanner';

interface CardReaderProps {
  onRead: (uid: string) => void;
  active?: boolean;
}

export default function CardReader({ onRead, active = true }: CardReaderProps) {
  const [nfcAvailable, setNfcAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNfcAvailable(isNfcSupported());
  }, []);

  if (nfcAvailable === null) {
    return <div className="py-4 text-center text-gray-500">デバイス確認中...</div>;
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {nfcAvailable ? (
        <NfcReader onRead={onRead} onError={setError} />
      ) : (
        <div>
          <p className="mb-3 text-center text-sm text-amber-600">
            NFC非対応デバイスのため、QRコードスキャナーで読み取ります
          </p>
          {active && <QrScanner onScan={onRead} onError={setError} />}
        </div>
      )}
    </div>
  );
}
