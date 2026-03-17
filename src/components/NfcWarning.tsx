'use client';

import { useState, useEffect } from 'react';
import { isNfcSupported } from '@/lib/nfc';

export default function NfcWarning() {
  const [nfcAvailable, setNfcAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    setNfcAvailable(isNfcSupported());
  }, []);

  if (nfcAvailable === null || nfcAvailable) return null;

  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
      このデバイスはNFC非対応です。QRコードモードで動作します。
    </div>
  );
}
