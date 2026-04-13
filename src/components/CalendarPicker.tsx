'use client';

import { useState } from 'react';

interface CalendarPickerProps {
  onSelect: (date: string) => void;
  onClose: () => void;
}

export default function CalendarPicker({ onSelect, onClose }: CalendarPickerProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  const handlePrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleSelect = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelect(dateStr);
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-lg border border-gray-200 text-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={handlePrev} className="rounded-lg p-2 hover:bg-gray-100">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-bold">
          {year}年 {month + 1}月
        </span>
        <button onClick={handleNext} className="rounded-lg p-2 hover:bg-gray-100">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {dayNames.map((name) => (
          <div key={name} className="py-1 text-center text-xs font-medium text-gray-500">
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          return (
            <button
              key={day}
              onClick={() => handleSelect(day)}
              className={`rounded-lg py-2 text-center text-sm transition-colors hover:bg-blue-100 ${
                isToday ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <button
        onClick={onClose}
        className="mt-3 w-full rounded-lg bg-gray-100 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
      >
        閉じる
      </button>
    </div>
  );
}
