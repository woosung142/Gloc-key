import React from 'react';
import {
  Sparkles,
  Paintbrush,
  MapPin,
  History,
  Check,
  RotateCw,
  Wand2
} from 'lucide-react';
import { OPTIONS_ATMOSPHERE, OPTIONS_REGION, OPTIONS_ERA } from '../constants';
import type { GenerateOptions } from '../../../services/api';

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
    { id: 'atmosphere', label: '분위기/화풍', icon: Paintbrush, state: selectedAtmosphere, setter: onAtmosphereChange, options: OPTIONS_ATMOSPHERE },
    { id: 'region', label: '지역/국가', icon: MapPin, state: selectedRegion, setter: onRegionChange, options: OPTIONS_REGION },
    { id: 'era', label: '역사적 시대', icon: History, state: selectedEra, setter: onEraChange, options: OPTIONS_ERA }
  ];

  return (
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
            {configs.map((config) => (
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
                onChange={(e) => onPromptChange(e.target.value)}
              />
              <div className="flex items-center justify-between px-8 pb-6">
                <div className="flex flex-col gap-1">
                  <div className="text-white/20 text-[10px] font-black uppercase tracking-widest">설정된 맥락</div>
                  <div className="text-[11px] font-bold text-[#B59458] tracking-wider uppercase flex items-center gap-2">
                    {selectedEra.label} <span className="text-white/10 text-[8px]">●</span> {selectedRegion.label} <span className="text-white/10 text-[8px]">●</span> {selectedAtmosphere.label}
                  </div>
                </div>

                <button
                  onClick={onGenerate}
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
  );
};
