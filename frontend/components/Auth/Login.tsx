import React, { useState } from 'react';
import { authService } from '../../services/auth';
import { Sparkles } from 'lucide-react';

interface Props {
  onSuccess: (user: any, token: string) => void;
  onSwitchToSignup: () => void;
}

const Login: React.FC<Props> = ({ onSuccess, onSwitchToSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      // authService.login(username, password)로 두 인자를 전달합니다.
      const response = await authService.login(username, password);
      
      if (response && response.token) {
        onSuccess(response.user, response.token);
      } else {
        throw new Error('Invalid response');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.response?.data?.message || '로그인에 실패했습니다. 계정 정보를 확인해주세요.');
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
            Professional Educator Hub
          </div>
          <h1 className="font-serif-ko text-6xl md:text-7xl font-black text-[#1E293B] tracking-tight">
            K-Edu <span className="text-[#B59458]">Vision</span>
          </h1>
          <p className="text-[#1E293B]/50 font-serif-ko text-xl italic">현대적 감각으로 재해석한 한국 교육의 미학</p>
        </div>

        <div className="w-full bg-white/80 backdrop-blur-xl rounded-[40px] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] p-10 md:p-14 border border-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-[#B59458] uppercase tracking-widest block ml-2">계정 아이디</label>
              <input
                type="text"
                required
                className="w-full px-8 py-5 bg-[#F9F7F2]/50 border border-slate-100 focus:border-[#B59458] focus:bg-white rounded-2xl outline-none transition-all font-medium text-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)} // 오타 수정: username -> setUsername
                placeholder="educator@vision.kr"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-black text-[#B59458] uppercase tracking-widest block ml-2">비밀번호</label>
              <input
                type="password"
                required
                className="w-full px-8 py-5 bg-[#F9F7F2]/50 border border-slate-100 focus:border-[#B59458] focus:bg-white rounded-2xl outline-none transition-all font-medium text-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-[#1E293B] text-white font-bold py-6 rounded-2xl hover:bg-[#B59458] transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 text-xl flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>집필실 입장하기</span>
                  <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-50 text-center">
            <button onClick={onSwitchToSignup} className="text-[#B59458] font-bold text-sm hover:underline underline-offset-8 transition-all">
              아직 회원이 아니신가요? 계정 생성하기
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

export default Login;