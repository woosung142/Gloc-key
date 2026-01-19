// frontend/components/Dashboard/LineageTree.tsx (또는 Dashboard.tsx 내부에 추가)

import React, { useMemo } from 'react';
import { UserImage } from '../../types';
import { MousePointer2, Trash2, Download, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  lineage: UserImage[];
  onEdit: (img: UserImage) => void;
  onDelete: (id: string) => void;
  onDownload: (url: string, title: string) => void;
}

const LineageTree: React.FC<Props> = ({ lineage, onEdit, onDelete, onDownload }) => {
  // 1. 데이터를 세대별(Depth)로 재구성
  const generations = useMemo(() => {
    const gens: UserImage[][] = [];
    const idToDepth: Record<string, number> = {};

    // 루트 찾기
    const root = lineage.find(img => !img.parentImageId);
    if (!root) return [];

    idToDepth[root.id] = 0;
    gens[0] = [root];

    // 나머지 이미지들의 깊이 계산 (최대 5세대까지 가정)
    lineage.forEach(img => {
      if (img.parentImageId && !idToDepth[img.id]) {
        // 부모의 깊이를 찾아 내 깊이 결정 (간단한 로직)
        let depth = 1;
        let currentParentId = img.parentImageId;
        while (currentParentId) {
          const parent = lineage.find(p => p.id === currentParentId);
          if (parent?.parentImageId) {
            depth++;
            currentParentId = parent.parentImageId;
          } else {
            break;
          }
        }
        if (!gens[depth]) gens[depth] = [];
        gens[depth].push(img);
      }
    });

    return gens;
  }, [lineage]);

  return (
    <div className="relative w-full overflow-x-auto py-20 px-10 custom-scrollbar bg-[#1E293B]/5 rounded-[50px]">
      <div className="flex gap-32 items-start min-w-max">
        {generations.map((gen, gIdx) => (
          <div key={gIdx} className="flex flex-col gap-12 relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-[#B59458] uppercase tracking-[0.3em] opacity-50">
              {gIdx === 0 ? 'Seed Origin' : `Generation ${gIdx}`}
            </div>
            
            {gen.map((img) => (
              <div key={img.id} className="relative group">
                {/* 시각적 연결선 (부모가 있는 경우) */}
                {img.parentImageId && (
                  <svg className="absolute -left-32 top-1/2 -translate-y-1/2 w-32 h-20 pointer-events-none z-0 overflow-visible">
                    <path
                      d="M 0 10 C 64 10, 64 10, 128 10" // 실제 부모 위치에 따른 계산 필요하나 기본 직선/곡선 처리
                      stroke="#B59458"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      fill="none"
                      className="opacity-30 group-hover:opacity-100 transition-opacity duration-500"
                    />
                  </svg>
                )}

                {/* 이미지 노드 카드 */}
                <div className={`relative w-56 bg-white rounded-3xl p-3 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border-2 ${
                  gIdx === 0 ? 'border-[#B59458]' : 'border-transparent hover:border-[#B59458]/30'
                }`}>
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4">
                    <img src={img.originalUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#1E293B]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <button onClick={() => onEdit(img)} className="p-2 bg-[#B59458] text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                         <MousePointer2 size={16} />
                       </button>
                    </div>
                  </div>
                  <div className="space-y-1 px-1">
                    <h5 className="text-[11px] font-bold text-[#1E293B] line-clamp-1 truncate">{img.title}</h5>
                    <p className="text-[9px] text-slate-400 font-medium">
                      {new Date(img.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* 노드 장식 */}
                  {gIdx === 0 && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#1E293B] text-[#B59458] rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                      <Sparkles size={14} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};