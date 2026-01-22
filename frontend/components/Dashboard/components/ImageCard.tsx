import React from 'react';
import { UserImage } from '../../../types';
import {
  Download,
  History,
  Trash2,
  ArrowUpRight,
  MousePointer2,
  LayoutGrid
} from 'lucide-react';

interface ImageCardProps {
  img: UserImage;
  onEdit: (img: UserImage) => void;
  onDownload: (url: string, title: string) => void;
  onViewLineage: (rootId: string, prompt: string) => void;
  onDelete: (id: string) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  img,
  onEdit,
  onDownload,
  onViewLineage,
  onDelete
}) => {
  return (
    <div className="group relative flex flex-col bg-white rounded-[40px] overflow-hidden border border-slate-100 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700">
      {/* Badge */}
      <div className="absolute top-5 left-5 z-20">
        <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${
          img.isEdit ? 'bg-[#B59458]/90 text-white border-[#B59458]' : 'bg-[#1E293B]/90 text-white border-[#1E293B]'
        }`}>
          {img.isEdit ? '편집본' : '원본'}
        </div>
      </div>

      {/* Image View */}
      <div className="aspect-[4/5] relative overflow-hidden cursor-pointer" onClick={() => onEdit(img)}>
        <img src={img.originalUrl} alt={img.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Quick Tools */}
        <div className="absolute top-5 right-5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(img.originalUrl, img.title); }}
            className="p-3 bg-white text-[#1E293B] hover:text-[#B59458] rounded-xl shadow-xl transition-colors"
            title="이미지 다운로드"
          >
            <Download size={18} />
          </button>

          {!img.isEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewLineage(img.id, img.title); }}
              className="p-3 bg-white text-slate-400 hover:text-[#B59458] rounded-xl shadow-xl transition-colors"
              title="편집 이력 보기"
            >
              <History size={18} />
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
            className="p-3 bg-white text-slate-300 hover:text-rose-500 rounded-xl shadow-xl transition-colors"
            title="자료 삭제"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="absolute bottom-8 left-8 right-8 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <div className="bg-[#B59458] text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#B59458]/40">
            스튜디오 편집기 <MousePointer2 size={14} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-4">
        <h4 className="font-serif-ko font-bold text-lg text-[#1E293B] line-clamp-2 leading-tight group-hover:text-[#B59458] transition-colors">
          {img.title}
        </h4>
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            {new Date(img.createdAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
          </span>
          <ArrowUpRight size={14} className="text-slate-200" />
        </div>
      </div>
    </div>
  );
};
