'use client';

import { useEffect, useRef, useState } from 'react';

interface QrScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  active?: boolean;
}

export default function QrScanner({ onScan, onError, active = true }: QrScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<unknown>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scanner: any = null;
    let isRunning = false;

    const initScanner = async () => {
      const { Html5Qrcode } = await import('html5-qrcode');
      const elementId = 'qr-reader';

      if (!document.getElementById(elementId)) return;

      scanner = new Html5Qrcode(elementId);
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
        isRunning = true;
        setInitialized(true);
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'カメラの起動に失敗しました');
      }
    };

    initScanner();

    return () => {
      if (scanner && isRunning) {
        scanner.stop().then(() => {
          scanner.clear();
        }).catch(() => {});
      }
      setInitialized(false);
    };
  }, [active, onScan, onError]);

  if (!active) return null;

  return (
    <div className="w-full">
      <div ref={containerRef} className="overflow-hidden rounded-xl">
        <div id="qr-reader" className="w-full" />
      </div>
      {!initialized && (
        <p className="mt-2 text-center text-sm text-gray-500">カメラを起動中...</p>
      )}
    </div>
  );
}
