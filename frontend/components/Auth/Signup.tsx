import React, { useState, useEffect } from 'react';
import { authService } from '../../services/auth';
import { Sparkles, UserPlus, CheckCircle2, XCircle } from 'lucide-react';
import { AlertType } from '../Common/CustomAlert';

interface Props {
  onSuccess: (user: any, token: string) => void;
  onSwitchToLogin: () => void;
  onAlert: (type: AlertType, title: string, message: string) => void;
}

const Signup: React.FC<Props> = ({ onSwitchToLogin, onAlert }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // 이메일 필드 추가
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // 비밀번호 확인 필드 추가
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordMatched, setIsPasswordMatched] = useState(true);

  // 비밀번호 일치 여부 실시간 체크
  useEffect(() => {
    if (confirmPassword.length > 0) {
      setIsPasswordMatched(password === confirmPassword);
    } else {
      setIsPasswordMatched(true);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      onAlert(
        'error',
        '가입 실패',
        '비밀번호가 일치하지 않습니다.\n올바른 정보를 입력해주세요.'
      );
      return;
    }

    setLoading(true);
    try {
      // 요청에 email 추가
      await authService.signup(username, password, email);
      onAlert(
        'success',
        '가입 성공',
        '환영합니다!'
      );
      onSwitchToLogin(); 
      
    } catch (error: any) {
      onAlert(
        'error',
        '가입 실패',
        error.response?.data?.message || '회원가입에 실패했습니다.\n올바른 정보를 입력해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-[#FDFCF9]">
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#B59458]/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] rounded-full bg-[#1E293B]/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-xl w-full flex flex-col items-center space-y-12 animate-fade-in py-10">
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#B59458]/30 bg-[#B59458]/5 text-[#B59458] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            Join the Educator Community
          </div>
          <h1 className="font-serif-ko text-6xl md:text-7xl font-black text-[#1E293B] tracking-tight">
            새로운 <span className="text-[#B59458]">인연</span>
          </h1>
          <p className="text-[#1E293B]/50 font-serif-ko text-xl italic">K-Edu Vision과 함께 교육의 미래를 설계하세요</p>
        </div>

        <div className="w-full bg-white/80 backdrop-blur-xl rounded-[40px] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] p-10 md:p-14 border border-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 성함 */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#B59458] uppercase tracking-widest block ml-2">성함</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 bg-[#F9F7F2]/50 border border-slate-100 focus:border-[#B59458] focus:bg-white rounded-2xl outline-none transition-all font-medium text-base"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
              />
            </div>

            {/* 아이디 */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#B59458] uppercase tracking-widest block ml-2">아이디</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 bg-[#F9F7F2]/50 border border-slate-100 focus:border-[#B59458] focus:bg-white rounded-2xl outline-none transition-all font-medium text-base"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="vision_id"
              />
            </div>

            {/* 이메일 추가 */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#B59458] uppercase tracking-widest block ml-2">이메일</label>
              <input
                type="email"
                required
                className="w-full px-6 py-4 bg-[#F9F7F2]/50 border border-slate-100 focus:border-[#B59458] focus:bg-white rounded-2xl outline-none transition-all font-medium text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="educator@vision.kr"
              />
            </div>

            {/* 비밀번호 */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#B59458] uppercase tracking-widest block ml-2">비밀번호</label>
              <input
                type="password"
                required
                className="w-full px-6 py-4 bg-[#F9F7F2]/50 border border-slate-100 focus:border-[#B59458] focus:bg-white rounded-2xl outline-none transition-all font-medium text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상 입력"
              />
            </div>

            {/* 비밀번호 확인 필드 및 실시간 상태 표시 */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#B59458] uppercase tracking-widest block ml-2">비밀번호 확인</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  className={`w-full px-6 py-4 bg-[#F9F7F2]/50 border ${!isPasswordMatched ? 'border-rose-400 focus:border-rose-500' : 'border-slate-100 focus:border-[#B59458]'} focus:bg-white rounded-2xl outline-none transition-all font-medium text-base`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 다시 입력"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                  {confirmPassword && (
                    isPasswordMatched ? 
                    <CheckCircle2 size={18} className="text-emerald-500 animate-in fade-in zoom-in" /> : 
                    <XCircle size={18} className="text-rose-500 animate-in fade-in zoom-in" />
                  )}
                </div>
              </div>
              {confirmPassword && !isPasswordMatched && (
                <p className="text-[10px] text-rose-500 font-bold ml-2 animate-in slide-in-from-top-1">비밀번호가 일치하지 않습니다.</p>
              )}
              {confirmPassword && isPasswordMatched && (
                <p className="text-[10px] text-emerald-600 font-bold ml-2 animate-in slide-in-from-top-1">비밀번호가 일치합니다.</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading || !isPasswordMatched || !confirmPassword}
              className="group w-full bg-[#1E293B] text-white font-bold py-5 rounded-2xl hover:bg-[#B59458] transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-30 text-lg flex items-center justify-center gap-3 mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>계정 생성하기</span>
                  <UserPlus size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <button onClick={onSwitchToLogin} className="text-[#B59458] font-bold text-sm hover:underline underline-offset-8 transition-all">
              이미 계정이 있으신가요? 로그인하기
            </button>
          </div>
        </div>
        
        <p className="text-[#1E293B]/30 text-[10px] font-bold uppercase tracking-[0.5em]">
          Copyright © 2025 K-Edu Vision. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Signup;