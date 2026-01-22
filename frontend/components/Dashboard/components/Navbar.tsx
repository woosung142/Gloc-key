import React from 'react';
import { User } from '../../../types';
import { BookOpen, LogOut, UserCircle, UserIcon } from 'lucide-react';
import { AlertType } from '../../Common/CustomAlert';


interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onProfileClick: () => void;
  onAlert: (
      type: AlertType, 
      title: string, 
      message: string, 
      onConfirm?: () => void, 
      cancelLabel?: string, 
      confirmLabel?: string
    ) => void;
}



export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onProfileClick, onAlert }) => {
  const handleLogoutClick = () => {
  onAlert(
    'confirm', 
    '로그아웃', 
    '현재 세션을 종료하고\n로그인 화면으로 돌아가시겠습니까?',
    onLogout, // 확인 누르면 실행될 함수
    '취소',
    '로그아웃'
  );
};
  
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
        <button 
        onClick={onProfileClick}
        className="flex items-center gap-2 hover:opacity-70 transition-opacity"
      >
        <div className="hidden md:flex flex-col items-end mr-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">교육자</span>
          <span className="text-sm font-bold text-[#1E293B]">{user?.name || '수석 집필진'}님</span>
        </div>
        <div className="w-10 h-10 bg-[#B59458]/10 text-[#B59458] rounded-xl flex items-center justify-center border border-[#B59458]/20 group-hover:bg-[#B59458] group-hover:text-white transition-all">
          <UserIcon size={20} />
        </div>
      </button>
        <button
          onClick={handleLogoutClick}
          className="p-2.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
          title="로그아웃"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};
