
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserImage, User } from '../../types';
import { imageService, GenerateOptions } from '../../services/api';
import CanvasEditor from '../Editor/CanvasEditor';
import { 
  Sparkles, LogOut, X, Search, BookOpen, ArrowUpRight, Palette, 
  ChevronRight, Trash2, AlertCircle, RotateCw, ListFilter, Filter, 
  Check, ChevronDown, UserCircle, Download, Wand2, MapPin, 
  History, Paintbrush, LayoutGrid, Layers, MousePointer2,
  GitBranch, FileText, Clock
} from 'lucide-react';

import { authService } from '../../services/auth';

interface Props {
  onLogout: () => void;
  user: User | null;
}

type SortOption = 'latest' | 'oldest' | 'name';
type FilterType = 'all' | 'original' | 'edit';

const LOADING_MESSAGES = [
  "교육적 맥락과 핵심 가치를 분석하고 있습니다...",
  "최적의 시각적 구도를 설계하는 중입니다...",
  "디지털 캔버스에 정교한 필치를 더하고 있습니다...",
  "역사적 고증과 현대적 미학을 조율하고 있습니다...",
  "거의 다 되었습니다. 마지막 영감을 불어넣는 중입니다..."
];

const OPTIONS_ATMOSPHERE = [
  { label: '수묵화', value: 'traditional Korean ink wash painting' },
  { label: '유화', value: 'classical oil painting' },
  { label: '세밀화', value: 'highly detailed scientific illustration' },
  { label: '수채화', value: 'soft watercolor painting' },
  { label: '실사', value: 'realistic high-definition photograph' },
  { label: '현대적 일러스트', value: 'modern clean digital illustration' },
];

const OPTIONS_REGION = [
  { label: '전국(일반)', value: 'Korea' },
  { label: '고구려', value: 'Goguryeo' },
  { label: '백제', value: 'Baekje' },
  { label: '신라', value: 'Silla' },
  { label: '고려', value: 'Goryeo' },
  { label: '조선', value: 'Joseon' },
  { label: '개항장', value: 'Korean port cities' },
];

const OPTIONS_ERA = [
  { label: '삼국시대', value: 'Three Kingdoms of Korea era' },
  { label: '고려시대', value: 'Goryeo dynasty' },
  { label: '조선 전기', value: 'Early Joseon dynasty' },
  { label: '조선 후기', value: 'Late Joseon dynasty' },
  { label: '대한제국', value: 'Korean Empire era' },
  { label: '일제강점기', value: 'Japanese colonial period' },
  { label: '근현대', value: 'Modern Korean history' },
];

const filterOptions = [
  { label: '전체 자료', value: 'all' },
  { label: '원본 자료', value: 'original' },
  { label: '편집 자료', value: 'edit' },
];

const sortOptions = [
  { label: '최근 입고순', value: 'latest' },
  { label: '오래된 순', value: 'oldest' },
  { label: '제목 가나다순', value: 'name' },
];

const Dashboard: React.FC<Props> = ({ onLogout, user }) => {
  const [images, setImages] = useState<UserImage[]>([]);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [activeImageRecord, setActiveImageRecord] = useState<UserImage | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [lastPrompt, setLastPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  
  const [selectedAtmosphere, setSelectedAtmosphere] = useState(OPTIONS_ATMOSPHERE[0]);
  const [selectedRegion, setSelectedRegion] = useState(OPTIONS_REGION[0]);
  const [selectedEra, setSelectedEra] = useState(OPTIONS_ERA[0]);

  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedRootId, setSelectedRootId] = useState<String | null>(null);
  const [selectedLineage, setSelectedLineage] = useState<UserImage[]>([]);

  const [isLineageOpen, setIsLineageOpen] = useState(false);
  const [shouldRenderLineage, setShouldRenderLineage] = useState(false);


  useEffect(() => {
    fetchHistory();
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) setIsSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setLoadingMsgIndex(0);
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const closeLineagePanel = () => {
    setIsLineageOpen(false);

    setTimeout(() => {
      setShouldRenderLineage(false);
    }, 300);
  };

  const openLineagePanel = (rootId: String) => {
  setSelectedRootId(rootId);
  setShouldRenderLineage(true);

  requestAnimationFrame(() => {
    setIsLineageOpen(true);
  });
};

  
  // 계보 데이터를 불러오는 함수
  const handleViewLineage = async (rootId: String) => {
  try {
    const data = await imageService.getEditImageHistory(String(rootId));
    setSelectedLineage(data);

    openLineagePanel(rootId); // ✅ 여기!
  } catch (error) {
    console.error("편집 내역을 불러오지 못했습니다:", error);
  }
};


  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await imageService.getHistory();
      setImages([...data]);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleDirectDownload = (url: string, title: string) => {
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = `K-Edu-${title.replace(/\s/g, '_')}.png`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const handleDirectDownload = async (url: string, title: string) => {
  try {
    // 캐시 문제 방지를 위해 cache: 'no-cache' 추가
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error('Network response was not ok');
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    // link.download = `K-Edu-${title.replace(/\s/g, '_')}.png`;
    link.download = `K-Edu-image.png`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("다운로드 중 오류가 발생했습니다:", error);
    // CORS 오류 시 마지막 수단: 새 창에서 열기
    window.open(url, '_blank');
  }
};

  const filteredAndSortedImages = useMemo(() => {
    let result = images.filter(img => {
      const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' 
        ? true 
        : filterType === 'edit' ? img.isEdit : !img.isEdit;
      return matchesSearch && matchesType;
    });

    if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  }, [images, sortBy, searchQuery, filterType]);

  // 1. 반환 타입 정의 (함수 밖 혹은 상단)
  interface GenerateResult {
    imageUrl: string;
    record: UserImage;
  }

  // 2. 함수 수정
  const handleGenerate = async (customPrompt?: string): Promise<GenerateResult | undefined> => {
  const targetPrompt = customPrompt || prompt;
  if (!targetPrompt.trim()) return;
  
  setIsGenerating(true);
  try {
    const options: GenerateOptions = {
      atmosphere: selectedAtmosphere.value,
      region: selectedRegion.value,
      era: selectedEra.value
    };
    
    // 1. 초기 생성 요청 및 jobId 획득
    const { jobId, imageUrl: initialUrl } = await imageService.generateEduImage(targetPrompt, options);
    
      let finalImageUrl = initialUrl;
      let finalImageId = "";

      // 2. 폴링 시작 (최대 30회 시도 - 약 1분)
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        const result = await imageService.checkGenerationStatus(jobId);
        
        if (result.status === 'COMPLETED') {
          finalImageUrl = result.imageUrl;
          finalImageId = String(result.imageId);
          break;
        } else if (result.status === 'FAILED') {
          throw new Error('AI 이미지 생성에 실패했습니다.');
        }

        // 5초 대기 후 다음 폴링
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }

      if (attempts === maxAttempts) throw new Error('생성 시간이 초과되었습니다.');

      // 3. 성공 후 데이터 처리
      await fetchHistory();
      const history = await imageService.getHistory();
      const newRecord = history.find(img => img.id === finalImageId) || history[0];
      
      setActiveImageUrl(finalImageUrl);
      setActiveImageRecord(newRecord);
      setIsEditorOpen(true);
      
      if (!customPrompt) setPrompt('');
      return { imageUrl: finalImageUrl, record: newRecord };

    } catch (error: any) {
      console.error(error);
      alert(error.message || '이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditExisting = (img: UserImage) => {
    setActiveImageRecord(img);
    setActiveImageUrl(img.originalUrl);
    setLastPrompt(img.title);
    setIsEditorOpen(true);
  };

  // const handleDeleteConfirm = async () => {
  //   if (!deleteTargetId) return;
  //   setIsDeleting(true);
  //   try {
  //     await imageService.deleteImageRecord(deleteTargetId);
  //     await fetchHistory();
  //     setDeleteTargetId(null);
  //   } catch (error) {
  //     alert('삭제 중 오류가 발생했습니다.');
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  const handleDeleteConfirm = async () => {
  if (!deleteTargetId) return;

  setIsDeleting(true);
  try {
    await imageService.deleteImageRecord(deleteTargetId);

    // ✅ 메인 리스트 갱신
    await fetchHistory();

    // ✅ 사이드바 계보에서도 제거
    setSelectedLineage(prev =>
      prev.filter(img => img.id !== deleteTargetId)
    );

    // (선택) 루트 삭제 시 사이드바 닫기
    if (deleteTargetId === selectedRootId) {
      closeLineagePanel();
    }

    setDeleteTargetId(null);
  } catch (error) {
    alert('삭제 중 오류가 발생했습니다.');
  } finally {
    setIsDeleting(false);
  }
};


  return (
    <div className="min-h-screen flex flex-col selection:bg-[#B59458]/20 selection:text-[#1E293B]">
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-[60] h-20 bg-white/80 backdrop-blur-2xl border-b border-slate-100 px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 stamp-motif flex items-center justify-center bg-[#1E293B] text-white rounded-lg">
            <BookOpen size={18} strokeWidth={1.5} />
          </div>
          <div className="h-8 w-px bg-slate-100"></div>
          <div>
            <h1 className="font-serif-ko text-xl font-black text-[#1E293B] tracking-tight">K-Edu Vision</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#B59458]">프리미엄 스튜디오</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">교육자</span>
            <span className="text-sm font-bold text-[#1E293B]">{user?.name || '수석 집필진'}님</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#B59458]">
            <UserCircle size={24} />
          </div>
          <button onClick={onLogout} className="p-2.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors" title="로그아웃">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20 space-y-32">
        {/* Generative Interface */}
        <section className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-tr from-[#B59458]/10 via-transparent to-[#1E293B]/5 blur-3xl rounded-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          
          <div className="relative bg-[#1E293B] rounded-[50px] overflow-hidden shadow-2xl">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none hanji-texture"></div>
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#B59458]/10 to-transparent pointer-events-none"></div>

            <div className="relative p-10 md:p-16 space-y-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#B59458]">
                    <Sparkles size={12} />
                    교육 AI 비주얼라이저
                  </div>
                  <h2 className="font-serif-ko text-4xl md:text-5xl font-black text-white leading-tight">
                    교육적 상상을 <span className="text-[#B59458]">명작</span>으로
                  </h2>
                </div>
                
                <div className="hidden lg:block text-right">
                  <p className="text-white/40 text-xs font-medium leading-relaxed italic">
                    "가장 정교한 역사적 고증과<br/>예술적 감각의 결합"
                  </p>
                </div>
              </div>

              {/* Advanced Configurator */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'atmosphere', label: '분위기/화풍', icon: Paintbrush, state: selectedAtmosphere, setter: setSelectedAtmosphere, options: OPTIONS_ATMOSPHERE },
                  { id: 'region', label: '지역/국가', icon: MapPin, state: selectedRegion, setter: setSelectedRegion, options: OPTIONS_REGION },
                  { id: 'era', label: '역사적 시대', icon: History, state: selectedEra, setter: setSelectedEra, options: OPTIONS_ERA }
                ].map((config) => (
                  <div key={config.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#B59458] uppercase tracking-widest opacity-80">
                      <config.icon size={14} /> {config.label}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {config.options.map(opt => (
                        <button 
                          key={opt.value} 
                          onClick={() => config.setter(opt)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-300 relative overflow-hidden group/opt ${
                            config.state.value === opt.value 
                              ? 'bg-[#B59458] text-white shadow-[0_0_20px_rgba(181,148,88,0.3)]' 
                              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="relative z-10 flex items-center gap-1.5">
                            {config.state.value === opt.value && <Check size={10} strokeWidth={4} />}
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Prompt Input Area */}
              <div className="relative group/prompt">
                <div className="absolute inset-0 bg-[#B59458]/20 rounded-[40px] blur-2xl opacity-0 group-focus-within/prompt:opacity-100 transition-opacity duration-700"></div>
                <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-2.5 focus-within:border-[#B59458]/50 transition-all duration-500">
                  <textarea
                    className="w-full bg-transparent px-8 pt-8 pb-4 rounded-[35px] text-white placeholder:text-white/20 focus:outline-none min-h-[140px] text-xl font-medium leading-relaxed resize-none custom-scrollbar"
                    placeholder="수업의 영감을 텍스트로 풀어주세요. (예: 정약용 선생의 거중기 설계를 현대적 건축 드로잉으로 표현해줘)"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <div className="flex items-center justify-between px-8 pb-6">
                    <div className="flex flex-col gap-1">
                      <div className="text-white/20 text-[10px] font-black uppercase tracking-widest">설정된 맥락</div>
                      <div className="text-[11px] font-bold text-[#B59458] tracking-wider uppercase flex items-center gap-2">
                        {selectedEra.label} <span className="text-white/10 text-[8px]">●</span> {selectedRegion.label} <span className="text-white/10 text-[8px]">●</span> {selectedAtmosphere.label}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleGenerate()}
                      disabled={isGenerating || !prompt.trim()}
                      className="group/gen bg-[#B59458] hover:bg-[#D4AF37] disabled:bg-white/10 disabled:text-white/20 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all duration-500 shadow-xl flex items-center gap-3 active:scale-95"
                    >
                      {isGenerating ? (
                        <RotateCw size={22} className="animate-spin" />
                      ) : (
                        <Wand2 size={22} className="group-hover/gen:rotate-12 transition-transform duration-500" />
                      )}
                      <span>자료 생성</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Archive Section */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-4">
              <h3 className="font-serif-ko text-4xl font-black text-[#1E293B]">나의 서고</h3>
              <div className="flex items-center gap-3">
                <div className="h-1 w-12 bg-[#B59458] rounded-full"></div>
                <p className="text-sm font-bold text-slate-400">총 {images.length}개의 자료를 보관 중입니다</p>
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-slate-100 pl-12 pr-6 py-4 rounded-2xl text-sm font-bold text-[#1E293B] outline-none focus:border-[#B59458] focus:ring-4 focus:ring-[#B59458]/5 transition-all w-full md:w-64"
                />
              </div>

              {/* 필터 드롭다운 (너비 고정) */}
              <div className="relative" ref={filterRef}>
                {/* <button 
                  onClick={() => { setIsFilterOpen(!isFilterOpen); setIsSortOpen(false); }}
                  className={`min-w-[140px] px-6 py-4 bg-white rounded-2xl border flex items-center justify-between gap-3 text-sm font-bold transition-all ${isFilterOpen ? 'border-[#B59458] ring-4 ring-[#B59458]/5' : 'border-slate-100'}`}
                >
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-[#B59458]" />
                    <span className="truncate">{filterOptions.find(o => o.value === filterType)?.label}</span>
                  </div>
                  <ChevronDown size={16} className={`flex-shrink-0 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button> */}
                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 py-2 animate-fade-in">
                    {filterOptions.map(opt => (
                      <button 
                        key={opt.value}
                        onClick={() => { setFilterType(opt.value as FilterType); setIsFilterOpen(false); }}
                        className="w-full px-6 py-3 hover:bg-slate-50 text-left text-sm font-bold flex items-center justify-between"
                      >
                        <span className={filterType === opt.value ? 'text-[#B59458]' : 'text-slate-600'}>{opt.label}</span>
                        {filterType === opt.value && <Check size={14} className="text-[#B59458]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 정렬 드롭다운 (너비 고정) */}
              <div className="relative" ref={sortRef}>
                <button 
                  onClick={() => { setIsSortOpen(!isSortOpen); setIsFilterOpen(false); }}
                  className={`min-w-[150px] px-6 py-4 bg-white rounded-2xl border flex items-center justify-between gap-3 text-sm font-bold transition-all ${isSortOpen ? 'border-[#B59458] ring-4 ring-[#B59458]/5' : 'border-slate-100'}`}
                >
                  <div className="flex items-center gap-2">
                    <ListFilter size={16} className="text-[#B59458]" />
                    <span className="truncate">{sortOptions.find(o => o.value === sortBy)?.label}</span>
                  </div>
                  <ChevronDown size={16} className={`flex-shrink-0 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSortOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 py-2 animate-fade-in">
                    {sortOptions.map(opt => (
                      <button 
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value as SortOption); setIsSortOpen(false); }}
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
                <div key={img.id} className="group relative flex flex-col bg-white rounded-[40px] overflow-hidden border border-slate-100 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700">
                  {/* Badge */}
                  <div className="absolute top-5 left-5 z-20">
                    <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${
                      img.isEdit ? 'bg-[#B59458]/90 text-white border-[#B59458]' : 'bg-[#1E293B]/90 text-white border-[#1E293B]'
                    }`}>
                      {img.isEdit ? '편집본' : '원본'}
                    </div>
                  </div>

                  {/* Image View */}
                  <div className="aspect-[4/5] relative overflow-hidden cursor-pointer" onClick={() => handleEditExisting(img)}>
                    <img src={img.originalUrl} alt={img.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Quick Tools */}
                    <div className="absolute top-5 right-5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                      <button onClick={(e) => { e.stopPropagation(); handleDirectDownload(img.originalUrl, img.title); }} className="p-3 bg-white text-[#1E293B] hover:text-[#B59458] rounded-xl shadow-xl transition-colors" title="이미지 다운로드">
                        <Download size={18} />
                      </button>

                      {/* --- 히스토리 버튼 추가 --- */}
                      {!img.isEdit && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleViewLineage(img.id); }}
                          className="p-3 bg-white text-slate-400 hover:text-[#B59458] rounded-xl shadow-xl transition-colors"
                          title="편집 이력 보기"
                        >
                          <History size={18} />
                        </button>
                      )}


                      <button onClick={(e) => { e.stopPropagation(); setDeleteTargetId(img.id); }} className="p-3 bg-white text-slate-300 hover:text-rose-500 rounded-xl shadow-xl transition-colors" title="자료 삭제">
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
      </main>

      {/* Loading Overlay */}
      {isGenerating && (
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
      )}

      {/* Delete Dialog */}
      {deleteTargetId && (
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
              <button onClick={handleDeleteConfirm} disabled={isDeleting} className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-rose-100">
                {isDeleting ? '폐기 처리 중...' : '폐기 확인'}
              </button>
              <button onClick={() => setDeleteTargetId(null)} className="w-full py-5 bg-slate-50 text-slate-400 hover:text-[#1E293B] rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Editor */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[100] bg-[#FDFCF9] flex items-center justify-center overflow-hidden animate-fade-in">
          <CanvasEditor 
            initialImageUrl={activeImageUrl}
            initialRecord={activeImageRecord}
            lastPrompt={lastPrompt}
            onRegenerate={async () => {
              const res = await handleGenerate(lastPrompt);
              if (res) {
                setActiveImageUrl(res.imageUrl);
                setActiveImageRecord(res.record);
              }
            }}
            onSave={() => { fetchHistory(); setIsEditorOpen(false); }}
          />
        </div>
      )}

      {/* History Timeline Side Panel */}
      {shouldRenderLineage && (
  <div className="fixed inset-0 z-[100] flex justify-end">
    {/* Backdrop */}
    <div
      onClick={closeLineagePanel}
      className={`
        absolute inset-0 bg-[#1E293B]/60 backdrop-blur-sm
        transition-opacity duration-300
        ${isLineageOpen ? 'opacity-100' : 'opacity-0'}
      `}
    />

    {/* Side Panel */}
    <div
      className={`
        relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col
        transform transition-transform duration-300 ease-out
        ${isLineageOpen ? 'translate-x-0' : 'translate-x-full'}
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
          onClick={closeLineagePanel}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <X size={24} className="text-slate-400" />
        </button>
      </header>

      {/* Content */}
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
                        handleDirectDownload(img.originalUrl, img.title)
                      }
                      className="p-2 bg-white text-slate-600 hover:text-[#B59458] rounded-xl shadow-md transition-colors"
                    >
                      <Download size={18} />
                    </button>

                    <button
                      onClick={() => {
                        setActiveImageUrl(img.originalUrl);
                        setActiveImageRecord(img);
                        setIsEditorOpen(true);
                        closeLineagePanel();
                      }}
                      className="px-4 py-2 bg-[#1E293B] text-white text-[10px] font-black uppercase rounded-lg shadow-lg hover:bg-black transition-all"
                    >
                      편집실 입장
                    </button>

                    <button
                      onClick={() => setDeleteTargetId(img.id)}
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
)}




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
    </div>
  );
};

export default Dashboard;
