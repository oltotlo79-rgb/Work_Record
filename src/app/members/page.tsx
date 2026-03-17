'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/types';

export default function MembersPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ employee_number: '', name: '', nfc_uid: '' });
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (res.ok) setEmployees(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEditForm({
      employee_number: emp.employee_number,
      name: emp.name,
      nfc_uid: emp.nfc_uid,
    });
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setError('');
  };

  const handleSave = async (id: string) => {
    setError('');
    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setEmployees((prev) => prev.map((e) => (e.id === id ? data : e)));
      setEditingId(null);
    } catch {
      setError('更新に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setEmployees((prev) => prev.filter((e) => e.id !== id));
      setDeleteConfirm(null);
    } catch {
      setError('削除に失敗しました');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-4 pt-8">
      <div className="w-full max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">メンバー一覧</h1>
          <div className="w-10" />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-500">読み込み中...</div>
        ) : employees.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm">登録されたメンバーはいません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((emp) => (
              <div key={emp.id} className="rounded-xl border border-gray-200 bg-white p-4">
                {editingId === emp.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">従業員番号</label>
                      <input
                        type="text"
                        value={editForm.employee_number}
                        onChange={(e) => setEditForm({ ...editForm, employee_number: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">氏名</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">NFC UID</label>
                      <input
                        type="text"
                        value={editForm.nfc_uid}
                        onChange={(e) => setEditForm({ ...editForm, nfc_uid: e.target.value.toUpperCase() })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(emp.id)}
                        className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        保存
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{emp.name}</p>
                      <p className="text-sm text-gray-500">{emp.employee_number}</p>
                      <p className="font-mono text-xs text-gray-400">{emp.nfc_uid}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100"
                      >
                        編集
                      </button>
                      {deleteConfirm === emp.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                          >
                            確認
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                          >
                            戻す
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(emp.id)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
