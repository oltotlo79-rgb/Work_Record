'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/types';
import QrCodeDisplay from '@/components/QrCodeDisplay';

export default function MembersPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ employee_number: '', name: '', nfc_uid: '' });
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [qrTarget, setQrTarget] = useState<Employee | null>(null);

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
    <div className="flex min-h-screen flex-col items-center p-6 pt-12 sm:pt-16">
      <div className="w-full max-w-2xl space-y-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="group glass-card rounded-2xl p-3 text-slate-400 hover:text-white border-white/5"
          >
            <svg className="h-6 w-6 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-gradient">メンバー一覧</h1>
          <div className="w-12" />
        </div>

        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-center text-sm text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center space-y-4">
            <svg className="mx-auto h-12 w-12 animate-spin text-blue-500/50" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-slate-500 font-medium italic">Finding team members...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-20 text-center border-dashed border-white/10">
            <div className="text-slate-600 mb-4 flex justify-center">
              <svg className="h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">登録済みメンバーがありません</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {employees.map((emp) => (
              <div key={emp.id} className="glass-card rounded-[1.5rem] border-white/5 p-6 overflow-hidden">
                {editingId === emp.id ? (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="ml-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee #</label>
                        <input
                          type="text"
                          value={editForm.employee_number}
                          onChange={(e) => setEditForm({ ...editForm, employee_number: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="ml-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">NFC UID</label>
                      <input
                        type="text"
                        value={editForm.nfc_uid}
                        onChange={(e) => setEditForm({ ...editForm, nfc_uid: e.target.value.toUpperCase() })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-blue-400 focus:border-blue-500/50 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleSave(emp.id)}
                        className="btn-premium flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500"
                      >
                        保存
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-slate-400 hover:text-white"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="text-xl font-bold text-white">{emp.name}</p>
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {emp.employee_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <p className="font-mono text-xs text-slate-500 font-medium">UID: <span className="text-slate-400">{emp.nfc_uid}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:self-center">
                      <button
                        onClick={() => setQrTarget(emp)}
                        className="glass-card rounded-xl px-4 py-2 text-xs font-bold text-amber-400 hover:text-amber-300 border-white/5"
                      >
                        QR
                      </button>
                      <button
                        onClick={() => handleEdit(emp)}
                        className="glass-card rounded-xl px-4 py-2 text-xs font-bold text-blue-400 hover:text-blue-300 border-white/5"
                      >
                        編集
                      </button>
                      {deleteConfirm === emp.id ? (
                        <div className="flex gap-2 animate-in slide-in-from-right-2 duration-300">
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          >
                            確定
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="glass-card rounded-xl px-4 py-2 text-xs font-bold text-slate-400 border-white/5"
                          >
                            止める
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(emp.id)}
                          className="glass-card rounded-xl px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 border-white/5"
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

      {/* QR Code Modal */}
      {qrTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-8 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-white">{qrTarget.name}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">ID: {qrTarget.employee_number}</p>
              </div>
              <button
                onClick={() => setQrTarget(null)}
                className="glass-card rounded-xl p-2 text-slate-400 hover:text-white border-white/5"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex justify-center rounded-2xl bg-white p-4">
              <QrCodeDisplay value={qrTarget.nfc_uid} label={qrTarget.employee_number} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
