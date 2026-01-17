
import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Group, Text, Path } from 'react-konva';
import { UserImage, KonvaElement } from '../../types';
import { imageService } from '../../services/api';
import { 
  Save, Trash2, RotateCw, Download, ArrowLeft, Palette, Sliders, 
  Layout, RefreshCcw, Repeat, Type, CheckCircle2, 
  ChevronRight, MousePointer2, Type as TypeIcon, Sparkles, X,
  AlertCircle
} from 'lucide-react';

interface Props {
  initialImageUrl: string | null;
  initialRecord: UserImage | null;
  lastPrompt?: string;
  onRegenerate: () => Promise<void>;
  onSave: () => void;
}

const K_PALETTE = [
  { name: '호백색', color: '#FFFFFF' },
  { name: '쪽빛', color: '#1E293B' },
  { name: '황금색', color: '#B59458' },
  { name: '연지색', color: '#963E3E' },
  { name: '담황색', color: '#E5DDC8' },
  { name: '먹색', color: '#1A1A1A' },
  { name: '비취색', color: '#7AA39E' },
  { name: '고운모래', color: '#F1EFE9' },
];

const CanvasEditor: React.FC<Props> = ({ initialImageUrl, initialRecord, lastPrompt, onRegenerate, onSave }) => {
  const [elements, setElements] = useState<KonvaElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const stageRef = useRef<any>(null);

  useEffect(() => {
  if (!initialImageUrl) return;

  const loadImage = async () => {
    try {
      // 1. URL 수정을 방지하기 위해 쿼리 파라미터(cb=...) 추가 로직을 제거합니다.
      // Pre-signed URL은 그 자체로 고유하므로 캐시 문제를 일으키지 않습니다.
      const response = await fetch(initialImageUrl, { 
        // 2. 캐시 정책을 'no-cache'로 설정하여 원본 서버에서 새로 가져오도록 유도합니다.
        cache: 'no-cache' 
      });

      if (!response.ok) {
        // 403 에러 발생 시 로그 출력
        console.error(`HTTP 에러 발생: ${response.status}`);
        throw new Error('Network response was not ok');
      }
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // 중요: 저장을 위해 필요
      img.src = objectUrl;
      img.onload = () => {
        setBaseImage(img);
      };
    } catch (error) {
      console.error("배경 이미지 로드 중 오류 발생:", error);
    }
  };

  loadImage();

  return () => {
    // 메모리 해제
    if (baseImage?.src.startsWith('blob:')) {
      URL.revokeObjectURL(baseImage.src);
    }
  };
}, [initialImageUrl]);

  const addBubble = (bubbleType: KonvaElement['bubbleType'] = 'oval') => {
    const newElement: KonvaElement = {
      id: `bubble_${Date.now()}`,
      type: 'bubble',
      bubbleType,
      x: 100,
      y: 100,
      width: 280,
      height: 180,
      rotation: 0,
      text: '수업 내용을 입력하세요',
      fontSize: 22,
      fill: '#FFFFFF',
      stroke: '#1E293B',
      strokeWidth: 4,
      opacity: 0.95,
      flipTail: false
    };
    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
    setIsDirty(true);
  };

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  const handleRegenerateAction = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    try {
      await onRegenerate();
      setIsDirty(true);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownload = () => {
    if (!stageRef.current) return;
    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 3 });
    const link = document.createElement('a');
    link.download = `K-Edu-Studio-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    if (!initialRecord?.id) {
      alert("원본 이미지 정보가 없습니다.");
      return;
    }

    setIsSaving(true); // 로딩 상태 시작
    try {
      // 1. 캔버스 이미지를 DataURL로 추출
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });

      // 2. 통합 저장 서비스 호출
      // Dashboard에서 넘겨받은 원본 ID(parentId)를 사용합니다.
      await imageService.saveImageRecord({
        parentId: initialRecord.id,
        dataUrl: dataUrl
      });

      alert("편집본이 서고에 저장되었습니다.");
      onSave(); // Dashboard의 fetchHistory 실행 및 에디터 닫기
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackClick = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      onSave();
    }
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  const updateSelectedElement = (attrs: Partial<KonvaElement>) => {
    setElements(elements.map(el => el.id === selectedId ? { ...el, ...attrs } : el));
    setIsDirty(true);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#F8F9FA] overflow-hidden">
      {/* Tool Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button onClick={handleBackClick} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors" title="뒤로가기">
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">스튜디오 편집기</span>
            <span className="text-xs font-bold text-[#1E293B] truncate max-w-[200px]">{initialRecord?.title || '제목 없는 자료'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-[#1E293B] font-bold text-xs rounded-xl transition-all">
            <Download size={16} /> 이미지 내보내기
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
              saveSuccess ? 'bg-green-600 text-white' : 'bg-[#1E293B] hover:bg-black text-white'
            }`}
          >
            {saveSuccess ? <CheckCircle2 size={16} /> : isSaving ? <RotateCw className="animate-spin" size={16} /> : <Save size={16} />}
            {saveSuccess ? '서고 보관 완료' : '최종본 보관'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar: Elements */}
        <aside className="w-[360px] bg-white border-r border-slate-200 flex flex-col z-40 shadow-xl shadow-slate-200/50">
          <div className="p-8 space-y-10 custom-scrollbar overflow-y-auto">
            {/* Style Selection */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-[#B59458] uppercase tracking-[0.2em] flex items-center gap-2">
                  <Layout size={14} /> 말풍선 자산
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'oval', name: '고전형', icon: '⬭' },
                  { id: 'rect', name: '현대형', icon: '▭' },
                  { id: 'shout', name: '강조형', icon: '💥' },
                  { id: 'thought', name: '생각형', icon: '💭' },
                  { id: 'scroll', name: '두루마리', icon: '📜' },
                  { id: 'cloud', name: '구름형', icon: '☁' }
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => addBubble(style.id as any)}
                    className="flex flex-col items-center gap-3 p-5 bg-slate-50 border border-transparent rounded-2xl hover:border-[#B59458]/40 hover:bg-white hover:shadow-xl transition-all group"
                  >
                    <span className="text-2xl group-hover:scale-125 transition-transform">{style.icon}</span>
                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-[#1E293B]">{style.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Properties Panel (Contextual) */}
            {selectedElement ? (
              <section className="animate-fade-in space-y-8 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black text-[#B59458] uppercase tracking-[0.2em]">요소 속성</h3>
                   <button onClick={() => { setElements(elements.filter(el => el.id !== selectedId)); setIsDirty(true); }} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors" title="요소 삭제">
                    <Trash2 size={16} />
                   </button>
                </div>

                {/* Text Control */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">내용 입력</label>
                  <textarea
                    className="w-full p-4 bg-slate-50 border border-transparent focus:border-[#B59458]/30 rounded-2xl text-sm font-bold text-[#1E293B] h-28 outline-none resize-none transition-all shadow-inner"
                    value={selectedElement.text || ''}
                    onChange={(e) => updateSelectedElement({ text: e.target.value })}
                    placeholder="교육 내용을 입력하세요..."
                  />
                </div>

                {/* Visual Controls */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">채우기</span>
                      <div className="flex flex-wrap gap-1.5">
                        {K_PALETTE.map((p) => (
                          <button key={p.color} onClick={() => updateSelectedElement({ fill: p.color })} className={`w-6 h-6 rounded-lg border transition-all ${selectedElement.fill === p.color ? 'border-[#B59458] ring-2 ring-[#B59458]/20 scale-110' : 'border-slate-100'}`} style={{ backgroundColor: p.color }} title={p.name} />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">테두리</span>
                      <div className="flex flex-wrap gap-1.5">
                        {K_PALETTE.map((p) => (
                          <button key={p.color} onClick={() => updateSelectedElement({ stroke: p.color })} className={`w-6 h-6 rounded-lg border transition-all ${selectedElement.stroke === p.color ? 'border-[#B59458] ring-2 ring-[#B59458]/20 scale-110' : 'border-slate-100'}`} style={{ backgroundColor: p.color }} title={p.name} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-50">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest"><span className="text-slate-400">테두리 두께</span><span className="text-[#B59458]">{selectedElement.strokeWidth}px</span></div>
                      <input type="range" min="0" max="20" className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-[#B59458]" value={selectedElement.strokeWidth || 0} onChange={(e) => updateSelectedElement({ strokeWidth: parseInt(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest"><span className="text-slate-400">투명도</span><span className="text-[#B59458]">{Math.round((selectedElement.opacity || 1) * 100)}%</span></div>
                      <input type="range" min="10" max="100" className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-[#B59458]" value={(selectedElement.opacity || 1) * 100} onChange={(e) => updateSelectedElement({ opacity: parseInt(e.target.value) / 100 })} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest"><span className="text-slate-400">글자 크기</span><span className="text-[#B59458]">{selectedElement.fontSize}px</span></div>
                      <input type="range" min="12" max="100" className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-[#B59458]" value={selectedElement.fontSize || 22} onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) })} />
                    </div>
                    
                    <button onClick={() => updateSelectedElement({ flipTail: !selectedElement.flipTail })} className="w-full py-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1E293B] flex items-center justify-center gap-2 hover:bg-[#1E293B] hover:text-white transition-all">
                      <Repeat size={14} /> 말꼬리 방향 반전
                    </button>
                  </div>
                </div>
              </section>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-30 select-none">
                <MousePointer2 size={48} className="mb-4" strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">캔버스의 요소를 선택하여<br/>속성을 편집하세요</p>
              </div>
            )}
            
            {/* Background Actions */}
            {lastPrompt && (
              <section className="pt-10 border-t border-slate-100">
                <button 
                  onClick={handleRegenerateAction}
                  disabled={isRegenerating}
                  className="w-full py-5 bg-[#B59458]/5 border border-[#B59458]/20 text-[#B59458] rounded-2xl flex items-center justify-center gap-3 hover:bg-[#B59458] hover:text-white transition-all group"
                >
                  <RefreshCcw size={16} className={isRegenerating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
                  <span className="text-[10px] font-black uppercase tracking-widest">배경 다시 생성하기</span>
                </button>
              </section>
            )}
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 bg-[#F1EFE9] hanji-texture relative flex items-center justify-center p-12 lg:p-24 overflow-auto">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1E293B 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
          
          <div className="relative group">
            <div className="absolute -inset-10 bg-[#B59458]/10 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-1000"></div>
            <div className="relative bg-white shadow-2xl rounded-sm p-8 border border-slate-200">
              <div className="absolute inset-0 border-[20px] border-white pointer-events-none z-10 rounded-sm"></div>
              <div className="absolute inset-4 border border-slate-50 pointer-events-none z-10 rounded-sm"></div>
              
              {isRegenerating && (
                <div className="absolute inset-8 z-30 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in rounded-sm">
                   <div className="stamp-motif w-20 h-20 flex items-center justify-center bg-[#1E293B] text-[#B59458] rounded-xl mb-6 shadow-2xl">
                      <Sparkles size={32} className="animate-pulse" />
                   </div>
                   <p className="font-serif-ko text-xl font-black text-[#1E293B]">새로운 배경 이미지를 집필 중...</p>
                </div>
              )}
              
              <div className="relative z-0" style={{ width: '800px', height: '600px' }}>
                <Stage width={800} height={600} ref={stageRef} onClick={handleStageClick} onTap={handleStageClick}>
                  <Layer>
                    {baseImage && (
                      <KonvaImage image={baseImage} width={800} height={600} onClick={() => setSelectedId(null)} onTap={() => setSelectedId(null)} />
                    )}
                    {elements.map((el) => (
                      <EditableItem
                        key={el.id}
                        element={el}
                        isSelected={el.id === selectedId}
                        onSelect={() => setSelectedId(el.id)}
                        onChange={(newAttrs) => {
                          setElements(elements.map(item => item.id === el.id ? { ...item, ...newAttrs } : item));
                          setIsDirty(true);
                        }}
                      />
                    ))}
                  </Layer>
                </Stage>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[600] bg-[#1E293B]/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white max-w-sm w-full rounded-[40px] p-12 shadow-2xl border border-slate-100 text-center space-y-8">
            <div className="w-20 h-20 bg-[#B59458]/10 text-[#B59458] rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={40} />
            </div>
            <div className="space-y-3">
              <h3 className="font-serif-ko text-3xl font-black text-[#1E293B]">저장되지 않은 변경사항</h3>
              <p className="text-slate-400 font-medium leading-relaxed italic text-sm">
                편집 중인 내용이 아직 저장되지 않았습니다.<br/>
                저장하지 않고 편집기를 나가시겠습니까?
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSave} 
                className="w-full py-5 bg-[#1E293B] hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl"
              >
                변경사항 저장 후 나가기
              </button>
              <button 
                onClick={() => onSave()} 
                className="w-full py-4 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                저장하지 않고 나가기
              </button>
              <button 
                onClick={() => setShowExitConfirm(false)} 
                className="w-full py-4 bg-slate-50 text-slate-400 hover:text-[#1E293B] rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                계속 편집하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ... BUBBLE_PATHS and EditableItem ...
const BUBBLE_PATHS = {
  oval: (w: number, h: number, flip: boolean) => {
    return flip 
      ? `M 0,${h/2} C 0,0 ${w},0 ${w},${h/2} C ${w},${h} ${w*0.75},${h} ${w*0.75},${h} L ${w*0.85},${h+35} L ${w*0.65},${h} C 0,${h} 0,${h/2} 0,${h/2} Z`
      : `M 0,${h/2} C 0,0 ${w},0 ${w},${h/2} C ${w},${h} ${w*0.25},${h} ${w*0.25},${h} L ${w*0.15},${h+35} L ${w*0.35},${h} C 0,${h} 0,${h/2} 0,${h/2} Z`;
  },
  rect: (w: number, h: number, flip: boolean) => {
    return flip
      ? `M 0,0 L ${w},0 L ${w},${h} L ${w*0.7},${h} L ${w*0.8},${h+30} L ${w*0.6},${h} L 0,${h} Z`
      : `M 0,0 L ${w},0 L ${w},${h} L ${w*0.3},${h} L ${w*0.2},${h+30} L ${w*0.4},${h} L 0,${h} Z`;
  },
  shout: (w: number, h: number, flip: boolean) => {
    const segments = 14;
    let d = `M 0,${h/2} `;
    for (let i = 1; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const r = i % 2 === 0 ? 1 : 1.25;
      const x = w/2 + (Math.cos(angle) * w/2 * r);
      const y = h/2 + (Math.sin(angle) * h/2 * r);
      d += `L ${x},${y} `;
    }
    const tx = flip ? w*0.8 : w*0.2;
    d += `L ${tx},${h+25} L ${tx + (flip ? -w*0.1 : w*0.1)},${h} Z`;
    return d;
  },
  thought: (w: number, h: number, flip: boolean) => {
    const main = `M 0,${h/2} A ${w/2},${h/2} 0 1 1 ${w},${h/2} A ${w/2},${h/2} 0 1 1 0,${h/2} Z`;
    const tx = flip ? w*0.75 : w*0.25;
    const ty = h + 20;
    const s1 = `M ${tx},${ty} A 10,10 0 1 1 ${tx+20},${ty} A 10,10 0 1 1 ${tx},${ty} Z`;
    const s2 = `M ${tx + (flip ? 20 : -20)},${ty+25} A 6,6 0 1 1 ${tx + (flip ? 32 : -8)},${ty+25} A 6,6 0 1 1 ${tx + (flip ? 20 : -20)},${ty+25} Z`;
    return main + " " + s1 + " " + s2;
  },
  scroll: (w: number, h: number) => {
    const r = 25;
    return `M ${r},0 L ${w-r},0 C ${w},0 ${w},${r} ${w},${r} L ${w},${h-r} C ${w},${h} ${w-r},${h} ${w-r},${h} L ${r},${h} C 0,${h} 0,${h-r} 0,${h-r} L 0,${r} C 0,0 ${r},0 ${r},0 Z M 0,${r*2} L ${w},${r*2} M 0,${h-r*2} L ${w},${h-r*2}`;
  },
  cloud: (w: number, h: number, flip: boolean) => {
    const r = 30;
    return flip
      ? `M ${r*2},${r} A ${r},${r} 0 0 1 ${w-r*2},${r} A ${r},${r} 0 0 1 ${w},${h/2} A ${r},${r} 0 0 1 ${w-r},${h-r} L ${w-r*2.5},${h-r} L ${w-r*3},${h+25} L ${w-r*2},${h-r} A ${r},${r} 0 0 1 0,${h/2} A ${r},${r} 0 0 1 ${r*2},${r} Z`
      : `M ${r*2},${r} A ${r},${r} 0 0 1 ${w-r*2},${r} A ${r},${r} 0 0 1 ${w},${h/2} A ${r},${r} 0 0 1 ${w-r},${h-r} L ${w-r*2},${h-r} L ${w-r*3},${h+25} L ${w-r*2.5},${h-r} A ${r},${r} 0 0 1 0,${h/2} A ${r},${r} 0 0 1 ${r*2},${r} Z`;
  }
};

const EditableItem: React.FC<{ element: KonvaElement; isSelected: boolean; onSelect: () => void; onChange: (newAttrs: any) => void; }> = ({ element, isSelected, onSelect, onChange }) => {
  const groupRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) { 
      transformerRef.current.nodes([groupRef.current]); 
      transformerRef.current.getLayer().batchDraw(); 
    }
  }, [isSelected]);

  const pathData = BUBBLE_PATHS[element.bubbleType || 'oval'](element.width, element.height, !!element.flipTail);
  
  return (
    <>
      <Group ref={groupRef} draggable x={element.x} y={element.y} rotation={element.rotation} onClick={onSelect} onTap={onSelect} onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })} onTransformEnd={() => {
          const node = groupRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1); node.scaleY(1);
          onChange({ x: node.x(), y: node.y(), width: Math.max(50, element.width * scaleX), height: Math.max(50, element.height * scaleY), rotation: node.rotation() });
        }}
      >
        <Path data={pathData} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth} opacity={element.opacity} shadowColor="black" shadowBlur={isSelected ? 20 : 5} shadowOpacity={0.15} lineJoin="round" lineCap="round" />
        <Text text={element.text} fontSize={element.fontSize || 22} fontFamily="'Noto Serif KR', serif" fontStyle="900" fill={element.stroke === '#FFFFFF' ? '#1a1a1a' : element.stroke} align="center" verticalAlign="middle" width={element.width * 0.84} height={element.height * 0.8} x={element.width * 0.08} y={element.height * 0.1} listening={false} lineHeight={1.4} />
      </Group>
      {isSelected && (
        <Transformer ref={transformerRef} boundBoxFunc={(oldBox, newBox) => (Math.abs(newBox.width) < 60 || Math.abs(newBox.height) < 40) ? oldBox : newBox} anchorFill="#B59458" anchorStroke="#1E293B" anchorSize={12} rotateEnabled={true} borderStroke="#B59458" borderDash={[5, 5]} />
      )}
    </>
  );
};

export default CanvasEditor;
