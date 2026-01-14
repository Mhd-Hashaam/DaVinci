
import React, { useEffect, useRef } from 'react';
import { Heart, Share2, Sparkles, ExternalLink } from 'lucide-react';

declare const gsap: any;

const EtherealCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current || !containerRef.current) return;

    // Entry animation
    gsap.fromTo(cardRef.current, 
      { opacity: 0, y: 50, scale: 0.9, rotateX: -10 },
      { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 1.5, ease: "expo.out" }
    );

    // 3D Tilt Effect
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = containerRef.current!.getBoundingClientRect();
      
      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;

      gsap.to(cardRef.current, {
        rotateY: x * 15,
        rotateX: -y * 15,
        duration: 0.6,
        ease: "power3.out",
        transformPerspective: 1200,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(cardRef.current, {
        rotateY: 0,
        rotateX: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.6)",
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative group p-10">
      <div 
        ref={cardRef}
        className="glass-card w-[340px] p-4 rounded-[2.75rem] flex flex-col gap-5 will-change-transform"
        style={{ 
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden'
        }}
      >
        {/* Image Section - The container for the parallax element */}
        <div 
          className="relative w-full aspect-[4/5.2] rounded-[2rem] overflow-hidden isolate"
          style={{ 
            transform: 'translateZ(40px)',
            // Essential hack to fix border-radius clipping during 3D transforms
            WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            maskImage: 'radial-gradient(white, black)'
          }}
        >
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" 
            alt="Ethereal Portrait"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 rounded-[2rem]"
          />
          
          {/* Top Actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-2.5">
            <button className="icon-button p-2.5 rounded-2xl text-white/90">
              <Heart size={18} />
            </button>
            <button className="icon-button p-2.5 rounded-2xl text-white/90">
              <Share2 size={18} />
            </button>
            <button className="icon-button p-2.5 rounded-2xl text-white/90">
              <Sparkles size={18} />
            </button>
          </div>

          {/* Bottom Shadow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 pointer-events-none"></div>
        </div>

        {/* Info Section */}
        <div className="px-3 flex flex-col gap-1" style={{ transform: 'translateZ(60px)' }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/40 bg-white/5 px-2 py-1 rounded-full border border-white/5">
              Portrait Series
            </span>
          </div>
          
          <div className="mt-2">
            <h3 className="text-white/60 text-sm font-medium tracking-tight">Original Art:</h3>
            <h2 className="text-white text-3xl font-bold tracking-tighter glow-text">
              Ethereal Queen
            </h2>
          </div>

          <div className="flex justify-between items-end mt-4">
            <div className="flex flex-col">
              <span className="text-xs text-white/30 font-semibold uppercase tracking-wider">Creator</span>
              <span className="text-white/70 font-medium">@Visionary_AI</span>
            </div>
            
            <button className="icon-button flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white">
              View
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative Shadow Blur behind card */}
      <div className="absolute -z-10 inset-10 bg-purple-500/10 blur-[80px] rounded-full scale-75 group-hover:scale-90 transition-transform duration-700"></div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="mesh-bg min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Moving background orbs */}
      <div className="absolute top-[20%] left-[15%] w-[30vw] h-[30vw] bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[20%] right-[15%] w-[25vw] h-[25vw] bg-fuchsia-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="z-10">
        <EtherealCard />
      </div>
    </div>
  );
};

export default App;
