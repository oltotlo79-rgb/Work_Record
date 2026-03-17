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
    <div className="glass-panel rounded-2xl border-amber-500/20 bg-amber-500/5 p-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-xs font-bold text-amber-500/80 tracking-tight leading-relaxed">
          NFC非対応デバイスです。QRコードモードをご利用ください。
        </p>
      </div>
    </div>
  );
}
