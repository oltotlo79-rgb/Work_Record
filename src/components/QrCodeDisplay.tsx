'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QrCodeDisplayProps {
  value: string;
  label?: string;
}

export default function QrCodeDisplay({ value, label }: QrCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: 200,
        margin: 2,
      });
    }
  }, [value]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode_${label || value}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} />
      <button
        onClick={handleDownload}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
      >
        QRコードをダウンロード
      </button>
    </div>
  );
}
