'use client';

import { useState, useEffect } from 'react';
import type { Employee } from '@/types';

interface MemberAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => void;
  viewerId: string;
  addedEmployeeIds: string[];
}

export default function MemberAddModal({ isOpen, onClose, onDone, viewerId, addedEmployeeIds }: MemberAddModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelected(new Set());
    setError(null);
    fetchEmployees();
  }, [isOpen]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (res.ok) setEmployees(data);
    } catch {
      setError('メンバーの取得に失敗しました');
    }
    setLoading(false);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (selected.size === 0) {
      onClose();
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const promises = Array.from(selected).map((employeeId) =>
        fetch('/api/viewing-members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            viewer_id: viewerId,
            target_employee_id: employeeId,
          }),
        })
      );

      const results = await Promise.all(promises);
      const failed = results.filter((r) => !r.ok && r.status !== 409);

      if (failed.length > 0) {
        setError(`${failed.length}件の追加に失敗しました`);
      } else {
        onDone();
        onClose();
      }
    } catch {
      setError('追加に失敗しました');
    }
    setSaving(false);
  };

  if (!isOpen) return null;

  const availableEmployees = employees.filter((e) => !addedEmployeeIds.includes(e.id));

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

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</div>
        )}

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-gray-500">読み込み中...</div>
          ) : availableEmployees.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <p className="text-sm">追加できるメンバーがいません</p>
            </div>
          ) : (
            <div className="space-y-1">
              {availableEmployees.map((emp) => (
                <label
                  key={emp.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                    selected.has(emp.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(emp.id)}
                    onChange={() => toggleSelect(emp.id)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm font-medium">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.employee_number}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || selected.size === 0}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
          >
            {saving ? '追加中...' : `${selected.size}件追加する`}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
