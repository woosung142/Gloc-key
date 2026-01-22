import React, { useState } from 'react';
import { User } from '../../types';
import { authService } from '../../services/auth';
import { AlertType } from '../Common/CustomAlert';
import { 
  ArrowLeft, LogOut, Key, AlertTriangle, 
  ChevronRight, UserX
} from 'lucide-react';

interface Props {
  user: User | null;
  onBack: () => void;
  onLogout: () => void;
  onAlert: (
    type: AlertType, 
    title: string, 
    message: string, 
    onConfirm?: () => void, 
    cancelLabel?: string, 
    confirmLabel?: string
  ) => void;
}

const MyPage: React.FC<Props> = ({ user, onBack, onLogout, onAlert }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

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

  // 비밀번호 변경 핸들러 수정
   const handleChangePassword = async (e: React.FormEvent) => {
   e.preventDefault();
   
   if (!currentPassword) {
      onAlert('info', '입력 필요', '현재 비밀번호를 입력해주세요.');
      return;
   }

   if (newPassword !== confirmPassword) {
      onAlert('error', '비밀번호 불일치', '새 비밀번호 확인이 일치하지 않습니다.');
      return;
   }

   if (newPassword.length < 8) {
      onAlert('info', '보안 요구사항', '새 비밀번호는 8자 이상이어야 합니다.');
      return;
   }

   setIsChanging(true);
   try {
      // PATCH /api/users/password { password, newPassword }
      await authService.changePassword(currentPassword, newPassword);
      
      onAlert('success', '업데이트 완료', '비밀번호가 성공적으로 변경되었습니다.');
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
   } catch (error: any) {
      onAlert(
         'error', 
         '변경 실패', 
         error.response?.data?.message || "비밀번호 변경에 실패했습니다. 현재 비밀번호를 다시 확인해주세요."
      );
   } finally {
      setIsChanging(false);
   }
   };

   // 회원탈퇴 클릭 시 (기존의 setShowWithdrawModal 대신 사용 가능)
   const handleWithdrawClick = () => {
   onAlert(
         'confirm', 
         '회원 탈퇴', 
         '탈퇴 시 모든 자료가 영구 삭제됩니다.\n정말 탈퇴하시겠습니까?',
         handleWithdraw, // 실제 탈퇴 로직 함수
         '취소',
         '탈퇴하기'
      );
   };
   const handleWithdraw = async () => {
   setIsWithdrawing(true);
   try {
      // DELETE /api/users/delete
      await authService.withdraw();
      
      onAlert('success', '탈퇴 완료', '회원 탈퇴가 완료되었습니다.\n그동안 이용해주셔서 감사합니다.');
      
      // 알림을 확인한 후 로그아웃 처리가 되도록 약간의 지연을 주거나 
      // CustomAlert의 onClose에서 처리하도록 설계하는 것이 좋지만, 
      // 현재 구조에서는 알림 호출 후 로그아웃을 진행합니다.
      onLogout(); 
   } catch (error: any) {
      onAlert('error', '오류 발생', '회원 탈퇴 처리 중 오류가 발생했습니다.');
   } finally {
      setIsWithdrawing(false);
   }
   };

  return (
    <div className="min-h-screen bg-[#FDFCF9] hanji-texture flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 flex items-center sticky top-0 z-50">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-[#1E293B] transition-colors font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>서고로 돌아가기</span>
        </button>
      </nav>

      <main className="max-w-2xl w-full px-8 py-20 space-y-12 animate-fade-in">
        {/* Profile Header */}
        <section className="text-center space-y-6">
           <div className="mx-auto w-24 h-24 stamp-motif flex items-center justify-center bg-[#1E293B] text-white rounded-3xl shadow-xl">
              <span className="font-serif-ko text-4xl font-black">{user?.name?.charAt(0)}</span>
           </div>
           <div className="space-y-1">
              <h2 className="font-serif-ko text-3xl font-black text-[#1E293B]">{user?.name}님</h2>
              {/* <p className="text-slate-400 text-sm font-medium">{user?.email || '이메일 정보 없음'}</p> */}
           </div>
        </section>

        {/* Change Password Card */}
        <section className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 space-y-8">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B59458]/10 text-[#B59458] flex items-center justify-center">
                 <Key size={20} />
              </div>
              <h3 className="font-serif-ko text-xl font-black text-[#1E293B]">비밀번호 변경</h3>
           </div>

           <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">현재 비밀번호</label>
                 <input 
                    type="password" 
                    className="w-full px-6 py-4 bg-slate-50 border border-transparent focus:border-[#B59458]/30 rounded-2xl text-sm font-bold outline-none transition-all"
                    placeholder="현재 사용 중인 비밀번호"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">새 비밀번호</label>
                 <input 
                    type="password" 
                    className="w-full px-6 py-4 bg-slate-50 border border-transparent focus:border-[#B59458]/30 rounded-2xl text-sm font-bold outline-none transition-all"
                    placeholder="8자 이상의 새 비밀번호"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">새 비밀번호 확인</label>
                 <input 
                    type="password" 
                    className="w-full px-6 py-4 bg-slate-50 border border-transparent focus:border-[#B59458]/30 rounded-2xl text-sm font-bold outline-none transition-all"
                    placeholder="새 비밀번호 재입력"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                 />
              </div>
              <button 
                type="submit"
                disabled={isChanging || !newPassword}
                className="w-full py-5 bg-[#1E293B] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-30"
              >
                {isChanging ? "변경 중..." : "비밀번호 업데이트"}
              </button>
           </form>
        </section>

        {/* Account Actions */}
        <section className="space-y-4">
           <button 
             onClick={handleLogoutClick}
             className="w-full flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 group hover:border-[#1E293B] transition-all"
           >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#1E293B] group-hover:text-white transition-all flex items-center justify-center">
                    <LogOut size={20} />
                 </div>
                 <span className="font-bold text-[#1E293B]">현재 세션 로그아웃</span>
              </div>
              <ChevronRight size={18} className="text-slate-200" />
           </button>

           <button 
             onClick={() => setShowWithdrawModal(true)}
             className="w-full flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 group hover:border-rose-100 transition-all"
           >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-300 group-hover:bg-rose-500 group-hover:text-white transition-all flex items-center justify-center">
                    <UserX size={20} />
                 </div>
                 <div className="text-left">
                    <span className="font-bold text-slate-400 group-hover:text-rose-500 transition-colors block">회원 탈퇴</span>
                    <span className="text-[10px] text-slate-300 font-medium">모든 이미지 기록이 영구 삭제됩니다.</span>
                 </div>
              </div>
              <ChevronRight size={18} className="text-slate-200" />
           </button>
        </section>

        <footer className="text-center pt-10">
           <p className="text-[#1E293B]/20 text-[10px] font-bold uppercase tracking-[0.4em]">
             Security Verified Educator Profile
           </p>
        </footer>
      </main>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[1000] bg-[#1E293B]/80 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-white max-w-sm w-full rounded-[40px] p-12 text-center space-y-8 shadow-2xl">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                 <AlertTriangle size={40} />
              </div>
              <div className="space-y-4">
                 <h3 className="font-serif-ko text-2xl font-black text-[#1E293B]">정말 떠나시나요?</h3>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    탈퇴 시 작성하신 모든 원본 자료와<br/>진화 계보 기록이 <span className="text-rose-500 font-bold">영구히 복구 불가능</span>하게 삭제됩니다.
                 </p>
              </div>
              <div className="flex flex-col gap-3">
                 <button 
                    onClick={handleWithdraw}
                    disabled={isWithdrawing}
                    className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                 >
                    {isWithdrawing ? "처리 중..." : "확인, 계정 삭제"}
                 </button>
                 <button 
                    onClick={() => setShowWithdrawModal(false)}
                    className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                 >
                    취소하고 돌아가기
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;