import React from 'react';
import {
  Sparkles,
  Paintbrush,
  MapPin,
  History,
  Check,
  RotateCw,
  Wand2,
  Settings2
} from 'lucide-react';
import { OPTIONS_ATMOSPHERE, OPTIONS_REGION, OPTIONS_ERA } from '../constants';

interface Config {
  id: string;
  label: string;
  icon: any;
  state: { label: string; value: string };
  setter: (value: { label: string; value: string }) => void;
  options: Array<{ label: string; value: string }>;
}

interface GeneratorSectionProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  selectedAtmosphere: { label: string; value: string };
  selectedRegion: { label: string; value: string };
  selectedEra: { label: string; value: string };
  onAtmosphereChange: (value: { label: string; value: string }) => void;
  onRegionChange: (value: { label: string; value: string }) => void;
  onEraChange: (value: { label: string; value: string }) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export const GeneratorSection: React.FC<GeneratorSectionProps> = ({
  prompt,
  onPromptChange,
  selectedAtmosphere,
  selectedRegion,
  selectedEra,
  onAtmosphereChange,
  onRegionChange,
  onEraChange,
  isGenerating,
  onGenerate
}) => {
  const configs: Config[] = [
    { id: 'era', label: '역사적 시대', icon: History, state: selectedEra, setter: onEraChange, options: OPTIONS_ERA },
    { id: 'region', label: '지역/국가', icon: MapPin, state: selectedRegion, setter: onRegionChange, options: OPTIONS_REGION },
    { id: 'atmosphere', label: '분위기/화풍', icon: Paintbrush, state: selectedAtmosphere, setter: onAtmosphereChange, options: OPTIONS_ATMOSPHERE }
  ];

  return (
    <section className="space-y-8 animate-fade-in">
      {/* Section Label: 아카이브와 통일된 라벨링 */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-[#1E293B] text-[#B59458] flex items-center justify-center rounded-xl shadow-sm">
          <Wand2 size={24} strokeWidth={1.5} />
        </div>
        <div>
          <span className="text-[10px] font-black text-[#B59458] uppercase tracking-[0.3em] block mb-0.5">Generator Engine</span>
          <h2 className="font-serif-ko text-3xl font-black text-[#1E293B] tracking-tight">지식 시각화 도구</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Sidebar (직선적이고 정돈된 설정창) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <Settings2 size={16} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parameters</span>
            </div>
            
            <div className="space-y-8">
              {configs.map((config) => (
                <div key={config.id} className="space-y-3">
                  <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    <config.icon size={14} /> {config.label}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {config.options.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => config.setter(opt)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                          config.state.value === opt.value
                            ? 'bg-[#1E293B] text-white border-[#1E293B] shadow-md'
                            : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {config.state.value === opt.value && <Check size={10} strokeWidth={4} />}
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Prompt Area (고급스러운 캔버스 느낌) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col focus-within:border-[#1E293B] transition-colors">
            <div className="p-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prompt Console</span>
              </div>
              <Sparkles size={14} className="text-[#B59458]" />
            </div>

            <textarea
              className="w-full flex-1 bg-transparent px-8 py-8 text-[#1E293B] placeholder:text-slate-300 focus:outline-none min-h-[220px] text-xl font-medium leading-relaxed resize-none"
              placeholder="생성하고자 하는 교육적 아이디어를 입력하십시오..."
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
            />

            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Metadata</span>
                <div className="text-[12px] font-bold text-[#B59458] flex items-center gap-2">
                  {selectedEra.label} <span className="text-slate-200">/</span> {selectedRegion.label} <span className="text-slate-200">/</span> {selectedAtmosphere.label}
                </div>
              </div>

              <button
                onClick={onGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full sm:w-auto min-w-[180px] bg-[#1E293B] hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <RotateCw size={18} className="animate-spin" />
                ) : (
                  <RotateCw size={18} />
                )}
                <span>{isGenerating ? '자료 생성 중...' : '자료 생성'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};