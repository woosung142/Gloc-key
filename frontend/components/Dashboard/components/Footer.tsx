import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-32 bg-white border-t border-slate-50">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-slate-100"></div>
          <div className="font-serif-ko text-2xl font-black text-[#1E293B]">K-Edu Vision</div>
          <div className="h-px w-12 bg-slate-100"></div>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed max-w-lg mx-auto italic font-medium">
          우리는 기술을 통해 교육의 본질적 가치를 시각화합니다.<br/>
          시대를 초월하는 영감의 보관소, K-Edu Vision.
        </p>
        <div className="text-[10px] font-black text-[#B59458] uppercase tracking-[0.5em] opacity-60">
          &copy; 2025 K-Edu Vision Global. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};
