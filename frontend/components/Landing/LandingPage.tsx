
import React, { useEffect, useState, useRef } from 'react';
import { 
  Sparkles, BookOpen, GitBranch, ShieldCheck, ArrowRight, 
  History, Layers, Cpu, ChevronRight, Globe, Zap, 
  Archive, Command, Terminal, MousePointer2, ExternalLink
} from 'lucide-react';

interface Props {
  onEnter: () => void;
  onSignup: () => void;
}

const LandingPage: React.FC<Props> = ({ onEnter, onSignup }) => {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. 네비게이션바 스크롤 감지
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // 2. 마우스 조명 효과 (Hero 섹션)
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const { clientX, clientY } = e;
        // 마우스 좌표를 CSS 변수로 전달
        heroRef.current.style.setProperty('--x', `${clientX}px`);
        heroRef.current.style.setProperty('--y', `${clientY}px`);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 3. 등장 애니메이션 (Reveal) 로직 보강
    // setTimeout을 사용하여 DOM이 완전히 렌더링된 후 관찰을 시작합니다.
    const revealTimeout = setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // 화면 하단에 조금 들어왔을 때 트리거
      });

      const revealElements = document.querySelectorAll('.reveal');
      revealElements.forEach(el => observer.observe(el));
      
      return () => observer.disconnect();
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(revealTimeout);
    };
  }, []);

  const galleryImages = [
    'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80'
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      {/* Dynamic Modern Navigation */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 px-6 lg:px-12 py-6 ${
        scrolled ? 'translate-y-0' : 'translate-y-2'
      }`}>
        <div className={`max-w-7xl mx-auto flex items-center justify-between px-8 py-3 transition-all duration-500 rounded-full ${
          scrolled ? 'bg-[#020617]/80 backdrop-blur-2xl border border-white/5 shadow-2xl scale-[1.01]' : 'bg-transparent'
        }`}>
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-[#B59458] flex items-center justify-center text-[#020617] rounded-xl shadow-[0_0_20px_rgba(181,148,88,0.3)] group-hover:scale-110 transition-transform">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-ko text-xl font-black tracking-tighter leading-none text-white">K-Edu Vision</span>
              <span className="text-[7px] font-black text-[#B59458] uppercase tracking-[0.5em] mt-1">Institutional Archive</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-12">
            {['Engine', 'Editor', 'Gallery', 'Enterprise'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-[0.2em]">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onEnter} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Sign In</button>
            <button 
              onClick={onSignup}
              className="px-8 py-3 bg-white text-[#020617] text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-[#B59458] hover:text-white transition-all shadow-xl active:scale-95 border border-white/10"
            >
              Start Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section: Interactive Spotlight */}
      <section ref={heroRef} className="glow-bg relative pt-60 pb-40 px-6 min-h-screen flex items-center justify-center overflow-hidden">
        {/* 레이어 1: 전체 베이스 배경 (매우 어둡고 흑백 느낌) */}
        <div className="absolute inset-0 -z-30 pointer-events-none">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1920&q=80')`,
              filter: 'brightness(0.15) grayscale(0.8) blur(2px)', // 거의 안 보이게 설정
            }}
          />
        </div>

      {/* 2. 마우스 위치에만 보이는 밝은 이미지 레이어 (Spotlight Effect) */}
      <div 
        className="spotlight-image absolute inset-0 -z-20 pointer-events-none"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
        
      <div className="absolute inset-0 -z-10 bg-[#020617]/40 pointer-events-none" />
      
        <div className="max-w-7xl mx-auto text-center space-y-16 relative z-10">
          <div className="reveal inline-flex items-center gap-3 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl">
            <Sparkles size={14} className="text-[#B59458] animate-pulse" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">K-EDU VISION v3.0</span>
          </div>

          <h1 className="reveal delay-100 font-serif-ko text-6xl md:text-[120px] font-black text-white leading-[0.9] tracking-[-0.05em]">
            교육의 모든 영감을<br/>
            <span className="text-gradient-gold">예술적 자산</span>으로.
          </h1>

          <p className="reveal delay-200 max-w-2xl mx-auto text-slate-400 text-lg md:text-2xl font-medium leading-relaxed">
            K-Edu Vision은 교육자의 통찰을 시각적 계보로 기록하고<br className="hidden md:block"/> 
            영구적으로 보존하는 가장 고귀한 엔터프라이즈 아카이브입니다.
          </p>

          <div className="reveal delay-300 flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
            <button 
              onClick={onSignup}
              className="group px-14 py-6 bg-[#B59458] text-[#020617] rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_50px_-10px_rgba(181,148,88,0.4)] hover:bg-white transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-4"
            >
              지금 무료로 시작하기
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            {/* <button className="px-14 py-6 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-white/10 transition-all backdrop-blur-3xl">
              Showcase 둘러보기
            </button> */}
          </div>
        </div>

        {/* Cinematic Backdrop Visual */}
        <div className="absolute inset-0 -z-20 opacity-20 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[radial-gradient(circle,rgba(30,41,59,1)_0%,rgba(2,6,23,1)_80%)]"></div>
        </div>
      </section>

      {/* Infinite Gallery Marquee */}
      <section id="gallery" className="py-20 bg-[#020617] overflow-hidden border-y border-white/5">
        <div className="space-y-12">
          <div className="reveal px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-[#B59458] uppercase tracking-[0.5em]">The Archive Flow</h3>
              <h2 className="font-serif-ko text-4xl font-black text-white">끊이지 않는 지식의 물결</h2>
            </div>
            <p className="text-slate-500 font-medium italic text-sm">실제 서비스에서 생성되어 아카이빙된 10만 개 이상의 마스터피스.</p>
          </div>

          <div className="relative">
            <div className="animate-marquee gap-6 px-6">
              {[...galleryImages, ...galleryImages].map((url, i) => (
                <div key={i} className="w-[300px] md:w-[450px] aspect-[4/5] rounded-[32px] overflow-hidden group relative glass-card">
                  <img src={url} className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105" alt="Masterpiece" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                     <span className="text-[8px] font-black text-[#B59458] uppercase tracking-widest mb-2">Heritage Record #{8201 + i}</span>
                     <h5 className="text-white font-serif-ko font-bold text-xl">교육 계보 복원 시리즈</h5>
                  </div>
                </div>
              ))}
            </div>
            {/* Edge Fades */}
            <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#020617] to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-[#020617] to-transparent z-10"></div>
          </div>
        </div>
      </section>

      {/* Problem & Solution: Cinematic Typography */}
      <section className="py-60 px-6 max-w-4xl mx-auto space-y-32">
        <div className="reveal space-y-12 text-center">
           <div className="w-20 h-20 bg-[#B59458]/10 text-[#B59458] rounded-3xl flex items-center justify-center mx-auto border border-[#B59458]/20 shadow-2xl">
              <Archive size={32} />
           </div>
           <h2 className="font-serif-ko text-4xl md:text-6xl font-black text-white leading-tight">
             대부분의 교육 자료는 <br className="hidden md:block"/> 
             생성과 동시에 <span className="text-slate-600 italic">휘발</span>됩니다.
           </h2>
           <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
             파일 형태의 저장은 한계가 있습니다. 진정한 아카이브는 <br className="hidden md:block"/>
             과거의 통찰이 미래의 영감으로 연결되는 <span className="text-[#B59458]">유기적인 계보</span>여야 합니다.
           </p>
        </div>
      </section>

      {/* Modern Bento Features with Hover States */}
      <section id="engine" className="py-40 px-6 max-w-7xl mx-auto space-y-24">
         <div className="reveal space-y-6 text-center lg:text-left">
            <h3 className="text-[10px] font-black text-[#B59458] uppercase tracking-[0.5em]">The Engine Suite</h3>
            <h2 className="font-serif-ko text-4xl md:text-6xl font-black text-white">현대적 기술과 고전의 조화</h2>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 auto-rows-[350px]">
            {/* Feature 1: AI Engine */}
            <div className="reveal md:col-span-12 lg:col-span-8 bg-gradient-to-br from-[#0F172A] to-[#020617] border border-white/10 rounded-[48px] p-12 flex flex-col justify-between group overflow-hidden relative shadow-2xl transition-all hover:border-[#B59458]/30">
               <div className="relative z-10 space-y-8">
                  <div className="w-16 h-16 bg-[#B59458]/10 text-[#B59458] rounded-2xl flex items-center justify-center border border-[#B59458]/20 group-hover:bg-[#B59458] group-hover:text-[#020617] transition-all duration-500">
                     <Cpu size={32} />
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-4xl font-serif-ko font-black">Heritage AI Engine</h4>
                     <p className="max-w-md text-slate-400 text-lg font-medium leading-relaxed">
                        단순 이미지를 넘어 교육적 맥락과 역사적 고증을 이해하는 <br/>
                        K-Edu 독자 모델이 당신의 상상을 완벽하게 구현합니다.
                     </p>
                  </div>
               </div>
               <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[120%] bg-[#B59458]/5 blur-[120px] rounded-full group-hover:bg-[#B59458]/10 transition-colors"></div>
               <div className="relative z-10 flex items-center gap-3 text-[#B59458] font-black text-[10px] uppercase tracking-widest cursor-pointer group-hover:gap-6 transition-all">
                  Engine Specifications <ChevronRight size={14} />
               </div>
            </div>

            {/* Feature 2: Editor */}
            <div id="editor" className="reveal delay-150 md:col-span-6 lg:col-span-4 bg-[#0F172A] border border-white/10 rounded-[48px] p-12 flex flex-col justify-between group hover:border-[#B59458]/40 transition-all shadow-2xl">
               <div className="space-y-8">
                  <div className="w-16 h-16 bg-white/5 text-white rounded-2xl flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform">
                     <Command size={32} />
                  </div>
                  <h4 className="text-3xl font-serif-ko font-black">Studio Editor</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">
                     전문가용 레이어 시스템과 <br/>직관적 인터페이스의 결합.
                  </p>
               </div>
               <div className="flex items-center gap-4 text-[#B59458]">
                  <MousePointer2 size={24} className="animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Interactive UI</span>
               </div>
            </div>

            {/* Feature 3: Lineage */}
            <div id="lineage" className="reveal delay-200 md:col-span-6 lg:col-span-5 bg-[#0F172A] border border-white/10 rounded-[48px] p-12 flex flex-col justify-between group overflow-hidden relative shadow-2xl">
               <div className="space-y-8">
                  <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
                     <GitBranch size={32} />
                  </div>
                  <h4 className="text-3xl font-serif-ko font-black">Lineage Trace</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">
                     원본에서 파생된 모든 변화를 <br/>시각적 계보로 추적합니다.
                  </p>
               </div>
               <div className="flex gap-1.5 overflow-hidden">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="h-1 flex-1 bg-white/5 rounded-full"><div className="h-full bg-blue-500/30 w-1/3 group-hover:w-full transition-all duration-1000"></div></div>)}
               </div>
            </div>

            {/* Feature 4: Enterprise Archive */}
            <div id="enterprise" className="reveal delay-300 md:col-span-12 lg:col-span-7 bg-white text-[#020617] rounded-[48px] p-12 flex flex-col md:flex-row items-center justify-between gap-12 group shadow-2xl border border-white/10">
               <div className="space-y-8">
                  <div className="w-16 h-16 bg-[#020617] text-[#B59458] rounded-2xl flex items-center justify-center shadow-xl">
                     <ShieldCheck size={32} />
                  </div>
                  <h4 className="text-4xl font-serif-ko font-black">Institutional Archive</h4>
                  <p className="max-w-xs text-slate-500 text-sm font-medium leading-relaxed">
                     영구 보존을 위한 엔터프라이즈 암호화와 <br/>
                     ISO 27001 표준의 강력한 보안 프로토콜.
                  </p>
               </div>
               <div className="relative">
                  <div className="w-40 h-40 bg-[#020617]/5 rounded-full border border-[#020617]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                     <Zap size={64} className="text-[#B59458]" />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Final CTA: Cinematic Spotlight */}
      <section className="py-60 px-6 relative flex items-center justify-center text-center overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[#B59458]/10 blur-[250px] rounded-full animate-pulse"></div>
         <div className="max-w-5xl space-y-20 relative z-10">
            <h2 className="reveal font-serif-ko text-6xl md:text-[140px] font-black text-white tracking-tighter leading-none">
              지식은 <br/> <span className="text-gradient-gold">영원</span>해야 합니다.
            </h2>
            <div className="reveal delay-200 flex flex-col md:flex-row justify-center items-center gap-8">
               <button 
                onClick={onSignup}
                className="px-20 py-8 bg-white text-[#020617] rounded-full font-black text-2xl shadow-2xl hover:bg-[#B59458] hover:text-white transition-all active:scale-95 group flex items-center gap-4"
               >
                  지금 무료로 시작하기
                  <ExternalLink size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               </button>
               {/* <button onClick={onEnter} className="px-20 py-8 bg-white/5 border border-white/10 text-white rounded-full font-black text-2xl hover:bg-white/10 transition-all backdrop-blur-3xl">
                  문의하기
               </button> */}
            </div>
            <div className="reveal delay-300 flex justify-center gap-16 text-slate-600 font-bold text-[10px] uppercase tracking-[0.6em]">
               <span>Cloud Native</span>
               <span>•</span>
               <span>ISO Certified</span>
               <span>•</span>
               <span>AI Heritage</span>
            </div>
         </div>
      </section>

      {/* Modern Dark Footer */}
      <footer className="py-24 px-8 md:px-12 bg-[#020617] border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-24">
           <div className="lg:col-span-5 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#B59458] flex items-center justify-center text-[#020617] rounded-xl shadow-lg">
                  <BookOpen size={24} />
                </div>
                <span className="font-serif-ko text-3xl font-black tracking-tighter text-white">K-Edu Vision</span>
              </div>
              <p className="max-w-sm text-slate-500 text-base font-medium leading-relaxed">
                우리는 교육자의 모든 통찰이 인류의 지적 자산이 되도록 <br/>
                가장 진보된 기술과 우아한 기록 방식을 연구합니다.
              </p>
              <div className="flex gap-8">
                 {['Twitter', 'LinkedIn', 'Instagram', 'Github'].map(s => <span key={s} className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#B59458] cursor-pointer transition-colors">{s}</span>)}
              </div>
           </div>
           
           <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-16">
              <div className="space-y-8">
                 <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Core Products</h5>
                 <ul className="space-y-5 text-sm font-bold text-slate-500">
                    <li className="hover:text-white cursor-pointer transition-colors">Lineage Engine</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Studio Editor</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Digital Archive</li>
                 </ul>
              </div>
              <div className="space-y-8">
                 <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Support</h5>
                 <ul className="space-y-5 text-sm font-bold text-slate-500">
                    <li className="hover:text-white cursor-pointer transition-colors">Documentation</li>
                    <li className="hover:text-white cursor-pointer transition-colors">API Keys</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Enterprise Plan</li>
                 </ul>
              </div>
              <div className="space-y-8">
                 <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Legal</h5>
                 <ul className="space-y-5 text-sm font-bold text-slate-500">
                    <li className="hover:text-white cursor-pointer transition-colors">Privacy</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Security</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Terms</li>
                 </ul>
              </div>
           </div>
        </div>
        <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">© 2025 K-Edu Vision. The Future of Heritage Archiving.</p>
           <div className="flex items-center gap-10">
              <Globe size={18} className="text-slate-700" />
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Global Intelligence Center</div>
           </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@900&display=swap');

        .font-serif-ko {
          font-family: 'Noto Serif KR', serif;
        }

        .text-gradient-gold {
          background: linear-gradient(to bottom, #FFFFFF 0%, #E6C894 50%, #B59458 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 30px rgba(0, 0, 0, 0.8));
        }

        /* Reveal Animation */
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }

        .delay-100 { transition-delay: 0.1s; }
        .delay-150 { transition-delay: 0.15s; }
        .delay-200 { transition-delay: 0.2s; }
        .delay-300 { transition-delay: 0.3s; }

        /* Infinite Marquee */
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* --- Spotlight Effect Core --- */

        .glow-bg {
          --x: 50%;
          --y: 50%;
          position: relative;
          background-color: #020617; /* 배경색 명시 */
        }

        /* 베이스 배경 (가장 뒤) */
        .bg-base-layer {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-size: cover;
          background-position: center;
          filter: brightness(0.15) grayscale(0.8);
          pointer-events: none;
        }

        /* 스포트라이트 레이어 (가장 앞의 이미지) */
        .spotlight-image {
          position: absolute;
          inset: 0;
          z-index: 10; /* 텍스트(z-10)와 겹치지 않게 주의하거나 텍스트를 더 높임 */
          background-size: cover;
          background-position: center;
          pointer-events: none;
          
          /* 마스크 설정 */
          mask-image: radial-gradient(
            300px circle at var(--x) var(--y),
            black 0%,
            rgba(0, 0, 0, 0.8) 25%,
            transparent 100%
          );
          -webkit-mask-image: radial-gradient(
            300px circle at var(--x) var(--y),
            black 0%,
            rgba(0, 0, 0, 0.8) 25%,
            transparent 100%
          );
          filter: brightness(1.3) contrast(1.1);
        }

        /* 금빛 광원 효과 - 이미지보다 위에 있어야 함 */
        .glow-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 20; 
          background: radial-gradient(
            500px circle at var(--x) var(--y),
            rgba(181, 148, 88, 0.25) 0%,
            transparent 70%
          );
          pointer-events: none;
          mix-blend-mode: screen;
        }
`}</style>
    </div>
  );
};

export default LandingPage;
