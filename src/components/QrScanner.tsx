'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface QrScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  active?: boolean;
}

export default function QrScanner({ onScan, onError, active = true }: QrScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<unknown>(null);
  const [scanning, setScanning] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const stopScanner = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scanner = scannerRef.current as any;
    if (scanner && scanning) {
      scanner.stop().then(() => {
        scanner.clear();
      }).catch(() => {});
    }
    scannerRef.current = null;
    setScanning(false);
    setInitialized(false);
  }, [scanning]);

  const startScanner = useCallback(async () => {
    const { Html5Qrcode } = await import('html5-qrcode');
    const elementId = 'qr-reader';

    if (!document.getElementById(elementId)) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scanner: any = new Html5Qrcode(elementId);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          onScan(decodedText);
        },
        () => {}
      );
      setScanning(true);
      setInitialized(true);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'カメラの起動に失敗しました');
    }
  }, [onScan, onError]);

  useEffect(() => {
    if (!active) {
      stopScanner();
    }
  }, [active, stopScanner]);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scanner = scannerRef.current as any;
      if (scanner) {
        scanner.stop().then(() => scanner.clear()).catch(() => {});
      }
    };
  }, []);

  if (!active) return null;

  return (
    <div className="w-full space-y-4">
      {!scanning ? (
        <button
          onClick={startScanner}
          className="btn-premium w-full flex items-center justify-center gap-3 rounded-2xl bg-amber-600 py-4 text-lg font-bold text-white shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:bg-amber-500 hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] transition-all"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          QRコードをスキャン
        </button>
      ) : (
        <div>
          <div ref={containerRef} className="overflow-hidden rounded-2xl border border-white/10">
            <div id="qr-reader" className="w-full" />
          </div>
          {!initialized && (
            <p className="mt-3 text-center text-sm text-slate-400">カメラを起動中...</p>
          )}
          <button
            onClick={stopScanner}
            className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-slate-400 hover:text-white transition-all"
          >
            スキャンを停止
          </button>
        </div>
      )}
    </div>
  );
}
