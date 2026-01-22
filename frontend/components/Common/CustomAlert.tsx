// frontend/components/Common/CustomAlert.tsx

import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'info' | 'confirm'; // 'confirm' 타입 추가

interface CustomAlertProps {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  onClose: () => void;
  // 추가된 속성
  onConfirm?: () => void; // 확인 버튼 클릭 시 실행할 함수
  cancelLabel?: string;    // 취소 버튼 텍스트 (없으면 확인 버튼만 표시)
  confirmLabel?: string;   // 확인 버튼 텍스트
}

export const CustomAlert: React.FC<CustomAlertProps> = ({ 
  isOpen, type, title, message, onClose, onConfirm, cancelLabel, confirmLabel = "확인" 
}) => {
  if (!isOpen) return null;

  const config = {
    success: { icon: <CheckCircle2 size={40} />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    error: { icon: <AlertCircle size={40} />, color: 'text-rose-500', bg: 'bg-rose-50' },
    info: { icon: <Info size={40} />, color: 'text-[#B59458]', bg: 'bg-[#B59458]/10' },
    confirm: { icon: <AlertTriangle size={40} />, color: 'text-amber-500', bg: 'bg-amber-50' },
  };

  const current = config[type];

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-[#1E293B]/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white max-w-sm w-full rounded-[40px] p-12 shadow-2xl border border-slate-100 text-center space-y-8 animate-zoom-in">
        <div className={`w-20 h-20 ${current.bg} ${current.color} rounded-full flex items-center justify-center mx-auto`}>
          {current.icon}
        </div>
        
        <div className="space-y-3">
          <h3 className="font-serif-ko text-3xl font-black text-[#1E293B]">{title}</h3>
          <p className="text-slate-400 font-medium leading-relaxed italic text-sm whitespace-pre-wrap">
            {message}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={handleConfirm} 
            className="w-full py-5 bg-[#1E293B] hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95"
          >
            {confirmLabel}
          </button>
          
          {/* cancelLabel이 있을 때만 취소 버튼 표시 */}
          {cancelLabel && (
            <button 
              onClick={onClose} 
              className="w-full py-4 bg-slate-50 text-slate-400 hover:text-[#1E293B] rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              {cancelLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};