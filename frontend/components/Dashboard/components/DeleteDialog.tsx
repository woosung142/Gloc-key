import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DeleteDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  isDeleting,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-[#1E293B]/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white max-w-sm w-full rounded-[40px] p-12 shadow-2xl border border-slate-100 text-center space-y-8">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-3">
          <h3 className="font-serif-ko text-3xl font-black text-[#1E293B]">자료 폐기</h3>
          <p className="text-slate-400 font-medium leading-relaxed italic">이 서책은 서고에서 영구히 제거됩니다.<br/>계속하시겠습니까?</p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-rose-100"
          >
            {isDeleting ? '폐기 처리 중...' : '폐기 확인'}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-5 bg-slate-50 text-slate-400 hover:text-[#1E293B] rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
