import React from 'react';
import { Wand2 } from 'lucide-react';
import { LOADING_MESSAGES } from '../constants';

interface LoadingOverlayProps {
  isVisible: boolean;
  loadingMsgIndex: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  loadingMsgIndex
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-[#1E293B]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8">
      <div className="relative mb-20 group">
        <div className="absolute -inset-20 bg-[#B59458]/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="stamp-motif w-32 h-32 flex items-center justify-center bg-[#1E293B] text-[#B59458] rounded-xl relative z-10 animate-bounce">
          <Wand2 size={48} strokeWidth={1} />
        </div>
        <div className="absolute -inset-8 border-2 border-dashed border-[#B59458]/30 rounded-full animate-[spin_12s_linear_infinite]"></div>
      </div>

      <div className="text-center space-y-10 max-w-xl">
        <div className="space-y-4">
          <h3 className="font-serif-ko text-4xl md:text-5xl font-black text-white leading-tight">
            교육의 가치를 <br/> <span className="text-[#B59458]">예술</span>로 승화시키는 중
          </h3>
          <p className="text-[#B59458] font-bold text-sm tracking-widest min-h-[1.5em] animate-pulse">
            {LOADING_MESSAGES[loadingMsgIndex]}
          </p>
        </div>

        <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#B59458] to-[#D4AF37] transition-all duration-[2500ms] ease-in-out"
            style={{ width: `${((loadingMsgIndex + 1) / LOADING_MESSAGES.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="absolute bottom-16 text-white/20 text-[10px] font-black uppercase tracking-[0.8em]">
        Neural Canvas Initialization
      </div>
    </div>
  );
};
