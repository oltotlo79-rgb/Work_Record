'use client';

interface ToggleSwitchProps {
  value: 'clock_in' | 'clock_out';
  onChange: (value: 'clock_in' | 'clock_out') => void;
}

export default function ToggleSwitch({ value, onChange }: ToggleSwitchProps) {
  return (
    <div className="flex w-full rounded-xl bg-gray-100 p-1">
      <button
        onClick={() => onChange('clock_in')}
        className={`flex-1 rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
          value === 'clock_in'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        始業
      </button>
      <button
        onClick={() => onChange('clock_out')}
        className={`flex-1 rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
          value === 'clock_out'
            ? 'bg-orange-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        終業
      </button>
    </div>
  );
}
