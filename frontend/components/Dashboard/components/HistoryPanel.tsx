import React from 'react';
import { UserImage } from '../../../types';
import { X, GitBranch, MessageSquare, FileText, Clock, ChevronRight, Sparkles, Download, Trash2 } from 'lucide-react';

interface HistoryPanelProps {
  isOpen: boolean;
  shouldRender: boolean;
  selectedRootPrompt: string | null;
  selectedLineage: UserImage[];
  onClose: () => void;
  onDownload: (url: string, title: string) => void;
  onEdit: (img: UserImage) => void;
  onDelete: (id: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  shouldRender,
  selectedRootPrompt,
  selectedLineage,
  onClose,
  onDownload,
  onEdit,
  onDelete
}) => {
  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`
          absolute inset-0 bg-[#1E293B]/60 backdrop-blur-sm
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
      />

      {/* Side Panel */}
      <div
        className={`
          relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <header className="h-20 border-b border-slate-100 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#B59458]/10 text-[#B59458] flex items-center justify-center">
              <GitBranch size={20} />
            </div>
            <div>
              <h3 className="font-serif-ko text-xl font-black text-[#1E293B]">
                타임라인
              </h3>
              <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">
                Lineage History
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </header>

        {/* Prompt Info */}
        <div className="border-b border-slate-100 px-8 py-5 bg-[#FAFAF9]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <MessageSquare size={12} />
              Original Prompt
            </div>

            <p className="text-sm text-slate-700 font-medium leading-relaxed line-clamp-3">
              {selectedRootPrompt?.trim()
                ? selectedRootPrompt
                : '프롬프트 정보가 없습니다.'}
            </p>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="space-y-16 relative">
            {/* Vertical Line */}
            <div className="absolute left-[29px] top-10 bottom-10 w-px bg-gradient-to-b from-[#B59458] via-[#B59458]/30 to-transparent z-0" />

            {selectedLineage.map((img, idx) => (
              <div key={img.id} className="relative z-10 flex gap-10 group/item">
                {/* Timeline Dot */}
                <div className="relative mt-2">
                  <div
                    className={`w-[60px] h-[60px] rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-xl ${
                      idx === 0
                        ? 'bg-[#1E293B] border-[#B59458] text-white'
                        : 'bg-white border-slate-100 group-hover/item:border-[#B59458] text-slate-300'
                    }`}
                  >
                    {idx === 0 ? (
                      <Sparkles size={24} />
                    ) : (
                      <FileText
                        size={24}
                        className="group-hover/item:text-[#B59458]"
                      />
                    )}
                  </div>

                  {idx > 0 && (
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex items-center text-[#B59458]">
                      <ChevronRight size={16} />
                    </div>
                  )}
                </div>

                {/* Card */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          idx === 0 ? 'text-[#B59458]' : 'text-slate-400'
                        }`}
                      >
                        {idx === 0 ? 'ORIGINAL ROOT' : `VERSION ${idx}`}
                      </span>
                      <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                        <Clock size={12} />
                        {new Date(img.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          onDownload(img.originalUrl, img.title)
                        }
                        className="p-2 bg-white text-slate-600 hover:text-[#B59458] rounded-xl shadow-md transition-colors"
                      >
                        <Download size={18} />
                      </button>

                      <button
                        onClick={() => {
                          onEdit(img);
                          onClose();
                        }}
                        className="px-4 py-2 bg-[#1E293B] text-white text-[10px] font-black uppercase rounded-lg shadow-lg hover:bg-black transition-all"
                      >
                        편집실 입장
                      </button>

                      <button
                        onClick={() => onDelete(img.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-100 shadow-xl group/img">
                    <img
                      src={img.originalUrl}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                      <h4 className="text-white font-serif-ko font-bold text-lg line-clamp-1">
                        {img.title}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
