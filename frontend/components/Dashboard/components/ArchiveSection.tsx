import React from 'react';
import { UserImage } from '../../../types';
import { Search, ListFilter, Filter, Check, ChevronDown, LayoutGrid, Library } from 'lucide-react';
import { FILTER_OPTIONS, SORT_OPTIONS } from '../constants';
import type { SortOption, FilterType } from '../hooks/useDashboard';
import { ImageCard } from './ImageCard';

interface ArchiveSectionProps {
  images: UserImage[];
  filteredAndSortedImages: UserImage[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  filterType: FilterType;
  onFilterChange: (value: FilterType) => void;
  isSortOpen: boolean;
  onSortOpenChange: (value: boolean) => void;
  isFilterOpen: boolean;
  onFilterOpenChange: (value: boolean) => void;
  sortRef: React.RefObject<HTMLDivElement>;
  filterRef: React.RefObject<HTMLDivElement>;
  onEdit: (img: UserImage) => void;
  onDownload: (url: string, title: string) => void;
  onViewLineage: (rootId: string, prompt: string) => void;
  onDelete: (id: string) => void;
}

export const ArchiveSection: React.FC<ArchiveSectionProps> = ({
  images,
  filteredAndSortedImages,
  isLoading,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterType,
  onFilterChange,
  isSortOpen,
  onSortOpenChange,
  isFilterOpen,
  onFilterOpenChange,
  sortRef,
  filterRef,
  onEdit,
  onDownload,
  onViewLineage,
  onDelete
  // <p className="text-sm font-bold text-slate-400">총 {images.length}개의 자료를 보관 중입니다</p>
}) => {
  return (
    <section className="space-y-12">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
      <div className="grid grid-cols-[48px_1fr] gap-x-4">
  {/* 아이콘 */}
  <div className="w-12 h-12 bg-[#1E293B] text-[#B59458] flex items-center justify-center rounded-xl shadow-sm">
    <Library size={24} strokeWidth={2} />
  </div>

  {/* 타이틀 영역 (아이콘 높이에 맞춤) */}
  <div className="flex flex-col justify-center space-y-1">
    <span className="text-[10px] font-black text-[#B59458] uppercase tracking-[0.3em]">
      My Archive
    </span>

    <h2 className="font-serif-ko text-4xl font-black text-[#1E293B] leading-none">
      나의 서고
    </h2>
  </div>

  {/* 설명 영역 (아이콘 아래) */}
  <div className="col-start-2 mt-2 flex items-center gap-3">
    <div className="h-1 w-12 bg-[#B59458] rounded-full"></div>
    <p className="text-sm font-bold text-slate-400">
      총 {images.length}개의 자료를 보관 중입니다
    </p>
  </div>
</div>
      
        <div className="flex flex-wrap items-center gap-4">
          {/* 검색창 */}
          <div className="relative group/search">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-[#B59458] transition-colors" />
            <input
              type="text"
              placeholder="자료 제목 검색..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-white border border-slate-100 pl-12 pr-6 py-4 rounded-2xl text-sm font-bold text-[#1E293B] outline-none focus:border-[#B59458] focus:ring-4 focus:ring-[#B59458]/5 transition-all w-full md:w-64"
            />
          </div>

          {/* 필터 드롭다운 */}
          <div className="relative" ref={filterRef}>
            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 py-2 animate-fade-in">
                {FILTER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { onFilterChange(opt.value as FilterType); onFilterOpenChange(false); }}
                    className="w-full px-6 py-3 hover:bg-slate-50 text-left text-sm font-bold flex items-center justify-between"
                  >
                    <span className={filterType === opt.value ? 'text-[#B59458]' : 'text-slate-600'}>{opt.label}</span>
                    {filterType === opt.value && <Check size={14} className="text-[#B59458]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 정렬 드롭다운 */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => { onSortOpenChange(!isSortOpen); onFilterOpenChange(false); }}
              className={`min-w-[150px] px-6 py-4 bg-white rounded-2xl border flex items-center justify-between gap-3 text-sm font-bold transition-all ${isSortOpen ? 'border-[#B59458] ring-4 ring-[#B59458]/5' : 'border-slate-100'}`}
            >
              <div className="flex items-center gap-2">
                <ListFilter size={16} className="text-[#B59458]" />
                <span className="truncate">{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
              </div>
              <ChevronDown size={16} className={`flex-shrink-0 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSortOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 py-2 animate-fade-in">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { onSortChange(opt.value as SortOption); onSortOpenChange(false); }}
                    className="w-full px-6 py-3 hover:bg-slate-50 text-left text-sm font-bold flex items-center justify-between"
                  >
                    <span className={sortBy === opt.value ? 'text-[#B59458]' : 'text-slate-600'}>{opt.label}</span>
                    {sortBy === opt.value && <Check size={14} className="text-[#B59458]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/5] bg-slate-50 rounded-[40px] animate-pulse"></div>)}
        </div>
      ) : filteredAndSortedImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredAndSortedImages.map((img) => (
            <ImageCard
              key={img.id}
              img={img}
              onEdit={onEdit}
              onDownload={onDownload}
              onViewLineage={onViewLineage}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="py-40 flex flex-col items-center justify-center bg-slate-50/50 rounded-[60px] border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-200 mb-8">
            <LayoutGrid size={40} />
          </div>
          <h3 className="font-serif-ko text-3xl font-black text-[#1E293B] mb-2">서고가 비어있습니다</h3>
          <p className="text-slate-400 font-medium italic">첫 번째 교육자료를 생성하여 영감을 기록해보세요</p>
        </div>
      )}
    </section>
  );
};