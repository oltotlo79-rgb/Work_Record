'use client';

import { useState } from 'react';
import type { Employee } from '@/types';

interface MemberAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (employee: Employee) => void;
  viewerId: string;
}

export default function MemberAddModal({ isOpen, onClose, onAdd, viewerId }: MemberAddModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/employees?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索エラー');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (employee: Employee) => {
    try {
      const res = await fetch('/api/viewing-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewer_id: viewerId,
          target_employee_id: employee.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onAdd(employee);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '追加エラー');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">閲覧メンバー追加</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="従業員番号または氏名"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
          >
            検索
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</div>
        )}

        <div className="max-h-60 overflow-y-auto">
          {results.length === 0 && !loading && (
            <p className="py-4 text-center text-sm text-gray-500">
              従業員を検索してください
            </p>
          )}
          {results.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0"
            >
              <div>
                <p className="text-sm font-medium">{emp.name}</p>
                <p className="text-xs text-gray-500">{emp.employee_number}</p>
              </div>
              <button
                onClick={() => handleAdd(emp)}
                className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
              >
                追加
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
