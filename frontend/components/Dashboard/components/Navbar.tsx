import React from 'react';
import { User } from '../../../types';
import { BookOpen, LogOut, UserCircle } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="sticky top-0 z-[60] h-20 bg-white/80 backdrop-blur-2xl border-b border-slate-100 px-8 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="w-10 h-10 stamp-motif flex items-center justify-center bg-[#1E293B] text-white rounded-lg">
          <BookOpen size={18} strokeWidth={1.5} />
        </div>
        <div className="h-8 w-px bg-slate-100"></div>
        <div>
          <h1 className="font-serif-ko text-xl font-black text-[#1E293B] tracking-tight">K-Edu Vision</h1>
          <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#B59458]">프리미엄 스튜디오</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end mr-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">교육자</span>
          <span className="text-sm font-bold text-[#1E293B]">{user?.name || '수석 집필진'}님</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#B59458]">
          <UserCircle size={24} />
        </div>
        <button
          onClick={onLogout}
          className="p-2.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
          title="로그아웃"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};
