'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MemberAddModal from '@/components/MemberAddModal';
import CalendarPicker from '@/components/CalendarPicker';
import type { AttendanceWithEmployee } from '@/types';
import type { Employee } from '@/types';

interface ViewingMemberWithEmployee {
  id: string;
  viewer_id: string;
  target_employee_id: string;
  employees: Pick<Employee, 'id' | 'employee_number' | 'name'>;
}

function getViewerId(): string {
  const match = document.cookie.match(/(?:^|; )employee_number=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' });
}

function getTodayStr(): string {
  const now = new Date();
  const jst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  return `${jst.getFullYear()}-${String(jst.getMonth() + 1).padStart(2, '0')}-${String(jst.getDate()).padStart(2, '0')}`;
}

function getCurrentJSTHour(): number {
  const now = new Date();
  const jst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  return jst.getHours();
}

export default function RecordsPage() {
  const router = useRouter();
  const [members, setMembers] = useState<ViewingMemberWithEmployee[]>([]);
  const [records, setRecords] = useState<AttendanceWithEmployee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [viewerId, setViewerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [selfEmployee, setSelfEmployee] = useState<Employee | null>(null);

  const isToday = selectedDate === getTodayStr();
  const isAdmin = viewerId === 'admin';

  // 自分自身 + viewing_members を結合した表示用リスト
  const allDisplayMembers: { id: string; target_employee_id: string; employees: Pick<Employee, 'id' | 'employee_number' | 'name'>; isSelf?: boolean }[] = (() => {
    const result: typeof allDisplayMembers = [];
    // 自分を先頭に追加
    if (selfEmployee && !members.some((m) => m.target_employee_id === selfEmployee.id)) {
      result.push({
        id: `self-${selfEmployee.id}`,
        target_employee_id: selfEmployee.id,
        employees: { id: selfEmployee.id, employee_number: selfEmployee.employee_number, name: selfEmployee.name },
        isSelf: true,
      });
    }
    result.push(...members.map((m) => ({ ...m, isSelf: m.target_employee_id === selfEmployee?.id })));
    return result;
  })();

  useEffect(() => {
    setViewerId(getViewerId());
  }, []);

  // 非admin: 自分の従業員情報を取得
  useEffect(() => {
    if (!viewerId || isAdmin) return;
    const fetchSelf = async () => {
      try {
        const res = await fetch(`/api/employees?q=${encodeURIComponent(viewerId)}`);
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          const me = data.find((e: Employee) => e.employee_number === viewerId);
          if (me) setSelfEmployee(me);
        }
      } catch { /* ignore */ }
    };
    fetchSelf();
  }, [viewerId, isAdmin]);

  const fetchMembers = useCallback(async () => {
    if (!viewerId || isAdmin) return;
    try {
      const res = await fetch(`/api/viewing-members?viewer_id=${encodeURIComponent(viewerId)}`);
      const data = await res.json();
      if (res.ok) setMembers(data);
    } catch { /* ignore */ }
  }, [viewerId, isAdmin]);

  const fetchRecords = useCallback(async () => {
    if (isAdmin) {
      setRecords([]);
      setLoading(false);
      return;
    }

    // 自分のIDも含めて取得
    const memberIds = members.map((m) => m.target_employee_id);
    if (selfEmployee && !memberIds.includes(selfEmployee.id)) {
      memberIds.unshift(selfEmployee.id);
    }

    if (memberIds.length === 0) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const ids = memberIds.join(',');
    try {
      const res = await fetch(`/api/attendance?employee_ids=${ids}&date=${selectedDate}`);
      const data = await res.json();
      if (res.ok) setRecords(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [members, selectedDate, isAdmin, selfEmployee]);

  useEffect(() => {
    if (viewerId) fetchMembers();
  }, [viewerId, fetchMembers]);

  useEffect(() => {
    fetchRecords();
  }, [members, selectedDate, selfEmployee, fetchRecords]);

  const handleMembersDone = () => {
    fetchMembers();
  };

  const handleRemoveMember = async (id: string) => {
    await fetch(`/api/viewing-members?id=${id}`, { method: 'DELETE' });
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowCalendar(false);
    setLoading(true);
  };

  const getRecordForEmployee = (employeeId: string) => {
    return records.find((r) => r.employee_id === employeeId);
  };

  const shouldHighlightRed = (employeeId: string, field: 'clock_in' | 'clock_out'): boolean => {
    if (!isToday) return false;
    const record = getRecordForEmployee(employeeId);
    const hour = getCurrentJSTHour();

    if (field === 'clock_in' && hour >= 8 && !record?.clock_in) return true;
    if (field === 'clock_out' && hour >= 17 && !record?.clock_out) return true;
    return false;
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-6 pt-12 sm:pt-16">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="group glass-card rounded-2xl p-3 text-slate-400 hover:text-white border-white/5"
          >
            <svg className="h-6 w-6 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-gradient">打刻確認</h1>
          <div className="w-12" />
        </div>

        {/* Date selection bar */}
        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${isToday ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-sm font-bold text-slate-200">
              {isToday ? 'TODAY' : selectedDate}
            </span>
          </div>
          <div className="flex gap-3">
            {!isToday && (
              <button
                onClick={() => { setSelectedDate(getTodayStr()); setLoading(true); }}
                className="btn-premium rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
              >
                今日へ
              </button>
            )}
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="glass-card rounded-xl px-4 py-2 text-xs font-bold text-slate-300 hover:text-white border-white/5"
            >
              日付選択
            </button>
          </div>
        </div>

        {showCalendar && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <CalendarPicker
              onSelect={handleDateSelect}
              onClose={() => setShowCalendar(false)}
            />
          </div>
        )}

        {isAdmin ? (
          <div className="glass-panel rounded-[2rem] p-10 text-center border-dashed border-amber-500/20 space-y-4">
            <div className="flex justify-center">
              <svg className="h-12 w-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-amber-400 font-bold text-sm">自身の従業員番号でログインしメンバーを追加することで打刻情報が見れるようになります。</p>
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowModal(true)}
              className="btn-premium w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/5 py-4 text-sm font-bold text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              閲覧メンバー追加
            </button>
          </>
        )}

        {/* Attendance list/table */}
        {isAdmin ? null : allDisplayMembers.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-20 text-center border-dashed border-white/10">
            <p className="text-slate-500 font-medium">閲覧メンバーが登録されていません</p>
          </div>
        ) : loading ? (
          <div className="py-20 text-center">
            <svg className="mx-auto h-12 w-12 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="glass-card rounded-[1.5rem] border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clock In</th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clock Out</th>
                    <th className="px-4 py-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allDisplayMembers.map((member) => {
                    const record = getRecordForEmployee(member.target_employee_id);
                    const clockInRed = shouldHighlightRed(member.target_employee_id, 'clock_in');
                    const clockOutRed = shouldHighlightRed(member.target_employee_id, 'clock_out');

                    return (
                      <tr key={member.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-bold text-white">{member.employees.name}{member.isSelf ? <span className="ml-1 text-[10px] text-blue-400">(自分)</span> : ''}</p>
                          <p className="text-[10px] font-bold text-slate-500 tracking-tighter uppercase">ID: {member.employees.employee_number}</p>
                        </td>
                        <td className={`px-6 py-4 text-center ${clockInRed ? 'animate-pulse' : ''}`}>
                          <div className={`inline-block px-3 py-1 rounded-full font-mono font-bold transition-all ${
                            clockInRed ? 'bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-slate-300'
                          }`}>
                            {formatTime(record?.clock_in ?? null)}
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-center ${clockOutRed ? 'animate-pulse' : ''}`}>
                          <div className={`inline-block px-3 py-1 rounded-full font-mono font-bold transition-all ${
                            clockOutRed ? 'bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-slate-300'
                          }`}>
                            {formatTime(record?.clock_out ?? null)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {!member.isSelf && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                              title="除外"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {!isAdmin && (
        <MemberAddModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onDone={handleMembersDone}
          viewerId={viewerId}
          addedMembers={members.map((m) => ({ viewingMemberId: m.id, employeeId: m.target_employee_id }))}
        />
      )}
    </div>
  );
}
