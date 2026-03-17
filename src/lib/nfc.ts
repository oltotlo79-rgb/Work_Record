export function isNfcSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'NDEFReader' in window;
}

export async function readNfcUid(): Promise<string> {
  if (!isNfcSupported()) {
    throw new Error('NFC is not supported on this device');
  }

  const ndef = new (window as unknown as { NDEFReader: new () => NDEFReader }).NDEFReader();
  await ndef.scan();

  return new Promise((resolve, reject) => {
    ndef.addEventListener('reading', ((event: Event) => {
      const readingEvent = event as NDEFReadingEvent;
      resolve(readingEvent.serialNumber.replace(/:/g, '').toUpperCase());
    }) as EventListener);

    ndef.addEventListener('readingerror', (() => {
      reject(new Error('NFC read error'));
    }) as EventListener);

    setTimeout(() => reject(new Error('NFC read timeout')), 30000);
  });
}

interface NDEFReader {
  scan(): Promise<void>;
  addEventListener(type: string, listener: EventListener): void;
}

interface NDEFReadingEvent extends Event {
  serialNumber: string;
}
