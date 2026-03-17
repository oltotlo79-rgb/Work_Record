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

  const isToday = selectedDate === getTodayStr();

  useEffect(() => {
    setViewerId(getViewerId());
  }, []);

  const fetchMembers = useCallback(async () => {
    if (!viewerId) return;
    try {
      const res = await fetch(`/api/viewing-members?viewer_id=${encodeURIComponent(viewerId)}`);
      const data = await res.json();
      if (res.ok) setMembers(data);
    } catch { /* ignore */ }
  }, [viewerId]);

  const fetchRecords = useCallback(async () => {
    if (members.length === 0) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const ids = members.map((m) => m.target_employee_id).join(',');
    try {
      const res = await fetch(`/api/attendance?employee_ids=${ids}&date=${selectedDate}`);
      const data = await res.json();
      if (res.ok) setRecords(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [members, selectedDate]);

  useEffect(() => {
    if (viewerId) fetchMembers();
  }, [viewerId, fetchMembers]);

  useEffect(() => {
    fetchRecords();
  }, [members, selectedDate, fetchRecords]);

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
          <h1 className="text-xl font-bold">打刻確認</h1>
          <div className="w-10" />
        </div>

        {/* Date selection */}
        <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
          <span className="text-sm font-medium">
            {isToday ? '今日' : selectedDate} の記録
          </span>
          <div className="flex gap-2">
            {!isToday && (
              <button
                onClick={() => { setSelectedDate(getTodayStr()); setLoading(true); }}
                className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              >
                今日に戻る
              </button>
            )}
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="rounded-lg bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300"
            >
              日付選択
            </button>
          </div>
        </div>

        {showCalendar && (
          <CalendarPicker
            onSelect={handleDateSelect}
            onClose={() => setShowCalendar(false)}
          />
        )}

        {/* Member controls */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600"
        >
          + 閲覧メンバー追加
        </button>

        {/* Attendance table */}
        {members.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm">閲覧メンバーが登録されていません</p>
            <p className="text-xs mt-1">「閲覧メンバー追加」ボタンから追加してください</p>
          </div>
        ) : loading ? (
          <div className="py-8 text-center text-gray-500">読み込み中...</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">氏名</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">始業</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">終業</th>
                  <th className="px-2 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const record = getRecordForEmployee(member.target_employee_id);
                  const clockInRed = shouldHighlightRed(member.target_employee_id, 'clock_in');
                  const clockOutRed = shouldHighlightRed(member.target_employee_id, 'clock_out');

                  return (
                    <tr key={member.id} className="border-t border-gray-100">
                      <td className="px-3 py-3">
                        <p className="font-medium">{member.employees.name}</p>
                        <p className="text-xs text-gray-500">{member.employees.employee_number}</p>
                      </td>
                      <td
                        className={`px-3 py-3 text-center font-mono ${
                          clockInRed ? 'bg-red-100 text-red-700 font-bold' : ''
                        }`}
                      >
                        {formatTime(record?.clock_in ?? null)}
                      </td>
                      <td
                        className={`px-3 py-3 text-center font-mono ${
                          clockOutRed ? 'bg-red-100 text-red-700 font-bold' : ''
                        }`}
                      >
                        {formatTime(record?.clock_out ?? null)}
                      </td>
                      <td className="px-2 py-3">
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-gray-400 hover:text-red-500"
                          title="削除"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MemberAddModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onDone={handleMembersDone}
        viewerId={viewerId}
        addedEmployeeIds={members.map((m) => m.target_employee_id)}
      />
    </div>
  );
}
