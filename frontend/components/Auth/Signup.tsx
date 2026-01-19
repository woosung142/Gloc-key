
import React, { useState } from 'react';
import { authService } from '../../services/auth';
import { Sparkles, UserPlus } from 'lucide-react';

interface Props {
  onSuccess: (user: any, token: string) => void;
  onSwitchToLogin: () => void;
}

const Signup: React.FC<Props> = ({ onSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    // 1. login이 아닌 signup 서비스를 호출합니다.
    // 백엔드 사양에 맞게 username, password를 전달합니다.
    await authService.signup(username, password);
    
    // 2. 성공 알림을 띄웁니다.
    alert('회원가입이 완료되었습니다. 로그인해주세요.');
    
    // 3. 부모 컴포넌트(App.tsx)에서 전달받은 로그인 화면 전환 함수를 호출합니다.
    onSwitchToLogin(); 
    
  } catch (error: any) {
    // 에러 메시지 처리 (중복 아이디 등)
    const errorMsg = error.response?.data?.message || '회원가입에 실패했습니다.';
    alert(errorMsg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-[#FDFCF9]">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#B59458]/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] rounded-full bg-[#1E293B]/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-xl w-full flex flex-col items-center space-y-12 animate-fade-in">
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-[#B59458] uppercase tracking-widest block ml-2">성함</label>
              <input
                type="text"
                required
                className="w-full px-8 py-4 bg-[#F9F7F2]/50 border border-slate-100 focus:border-[#B59458] focus:bg-white rounded-2xl outline-none transition-all font-medium text-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-[#B59458] uppercase tracking-widest block ml-2">아이디</label>
              <input
                type="text"
                required
                className="w-full px-8 py-4 bg-[#F9F7F2]/50 border border-slate-100 focus:border-[#B59458] focus:bg-white rounded-2xl outline-none transition-all font-medium text-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="educator@vision.kr"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-[#B59458] uppercase tracking-widest block ml-2">비밀번호</label>
              <input
                type="password"
                required
                className="w-full px-8 py-4 bg-[#F9F7F2]/50 border border-slate-100 focus:border-[#B59458] focus:bg-white rounded-2xl outline-none transition-all font-medium text-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상 입력"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-[#1E293B] text-white font-bold py-6 rounded-2xl hover:bg-[#B59458] transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 text-xl flex items-center justify-center gap-3 mt-4"
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

          <div className="mt-10 pt-10 border-t border-slate-50 text-center">
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
