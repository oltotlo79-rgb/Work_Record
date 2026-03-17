'use client';

import { useRouter } from 'next/navigation';
import NfcWarning from '@/components/NfcWarning';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/login');
  };

  const navItems = [
    {
      title: '打刻記録',
      path: '/attendance',
      icon: '/images/icons/attendance.png',
      color: 'from-blue-500/20 to-blue-600/20',
      border: 'border-blue-500/30'
    },
    {
      title: 'メンバー登録',
      path: '/register',
      icon: '/images/icons/register.png',
      color: 'from-emerald-500/20 to-emerald-600/20',
      border: 'border-emerald-500/30'
    },
    {
      title: 'メンバー一覧',
      path: '/members',
      icon: '/images/icons/members.png',
      color: 'from-teal-500/20 to-teal-600/20',
      border: 'border-teal-500/30'
    },
    {
      title: '打刻確認',
      path: '/records',
      icon: '/images/icons/records.png',
      color: 'from-purple-500/20 to-purple-600/20',
      border: 'border-purple-500/30'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-lg space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="text-gradient">打刻記録システム</span>
          </h1>
          <p className="text-slate-400 font-medium">Smart Attendance Management</p>
        </div>

        <NfcWarning />

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`glass-card group flex flex-col items-center justify-center gap-4 rounded-3xl border ${item.border} bg-gradient-to-br ${item.color} p-6 sm:p-8 btn-premium`}
            >
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Image
                  src={item.icon}
                  alt={item.title}
                  fill
                  className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                />
              </div>
              <span className="text-base font-bold text-white/90 sm:text-lg">
                {item.title}
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 px-6 py-3 rounded-full glass-card text-sm font-semibold text-slate-300 hover:text-white border-white/5"
          >
            <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}
