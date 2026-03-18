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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">閲覧メンバー追加</h3>
          <button onClick={onClose} className="glass-card rounded-xl p-2 text-slate-400 hover:text-white border-white/5">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
        )}

        <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
          {loading ? (
            <div className="py-8 text-center text-slate-500">読み込み中...</div>
          ) : availableEmployees.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p className="text-sm">追加できるメンバーがいません</p>
            </div>
          ) : (
            availableEmployees.map((emp) => (
              <label
                key={emp.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                  selected.has(emp.id) ? 'bg-blue-500/15 border border-blue-500/30' : 'border border-transparent hover:bg-white/5'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(emp.id)}
                  onChange={() => toggleSelect(emp.id)}
                  className="h-5 w-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500/30"
                />
                <div>
                  <p className="text-sm font-bold text-white">{emp.name}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ID: {emp.employee_number}</p>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || selected.size === 0}
            className="btn-premium flex-1 rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-40"
          >
            {saving ? '追加中...' : `${selected.size}件追加する`}
          </button>
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-400 hover:text-white transition-all"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
