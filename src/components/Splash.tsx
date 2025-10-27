import React from "react";

type SplashProps = { onFinish?: () => void };

const C = {
    indigo: "#6E5DFF",
    sky: "#59C2FF",
    pink: "#FF85C8",
    glow: "#CFE9FF",
};

export default function Splash({ onFinish }: SplashProps) {
    const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
    const [phase, setPhase] = React.useState<'intro' | 'approach' | 'tunnel' | 'done'>('intro');
    const wordRef = React.useRef<HTMLDivElement>(null);
    const tunnelRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const onMove = (e: PointerEvent) => {
            const { innerWidth: w, innerHeight: h } = window;
            const x = ((e.clientX / w) - .5) * 8;
            const y = ((e.clientY / h) - .5) * -8;
            setTilt({ x, y });
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, []);

    React.useEffect(() => {
        const t1 = setTimeout(() => setPhase('approach'), 800);
        const t2 = setTimeout(() => setPhase('tunnel'), 1700);
        const t3 = setTimeout(() => setPhase('done'), 2500);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    React.useEffect(() => {
        if (phase === 'done') {
            const t = setTimeout(() => onFinish?.(), 120);
            return () => clearTimeout(t);
        }
    }, [phase, onFinish]);

    React.useLayoutEffect(() => {
        if (!wordRef.current || !tunnelRef.current) return;
        const r = wordRef.current.getBoundingClientRect();
        const cx = r.left + r.width * 0.62;
        const cy = r.top + r.height * 0.55;
        tunnelRef.current.style.setProperty('--cx', `${cx}px`);
        tunnelRef.current.style.setProperty('--cy', `${cy}px`);
    }, [phase]);

    return (
        <div
            className={`fixed inset-0 z-[9999] overflow-hidden text-white flex items-center justify-center
                  ${phase === 'done' ? 'pointer-events-none opacity-0 transition-opacity duration-100' : ''}`}
            style={{
                // fond global très léger bleuté (comme ton visuel)
                background: `linear-gradient(145deg, #0B1020 0%, #0B1230 40%, #0D1538 100%)`,
            }}
            aria-hidden
        >
            {/* Halos concordants à la palette */}
            <div className="absolute inset-0">
                <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full blur-3xl animate-floatA"
                    style={{ background: `linear-gradient(135deg, ${C.indigo}33, ${C.sky}26)` }} />
                <div className="absolute -bottom-36 -right-28 w-[560px] h-[560px] rounded-full blur-3xl animate-floatB"
                    style={{ background: `linear-gradient(135deg, ${C.pink}26, ${C.indigo}26)` }} />
                <div className="absolute inset-0"
                    style={{ background: `radial-gradient(900px 500px at 50% 35%, ${C.glow}14, transparent 60%)` }} />
                <StarField starColor={`${C.glow}B3`} />
            </div>

            {/* Mot FLUXY avec dégradé de l’icône */}
            <div
                ref={wordRef}
                className="relative select-none will-change-transform"
                style={{
                    transform:
                        phase === 'approach' ? `translateZ(0) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(1.25)` :
                            phase === 'tunnel' ? `translateZ(0) scale(6)` :
                                `translateZ(0) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(1)`,
                    transition:
                        phase === 'approach' ? 'transform 900ms cubic-bezier(.2,.7,.2,1)' :
                            phase === 'tunnel' ? 'transform 800ms cubic-bezier(.2,.7,.2,1)' :
                                'transform 600ms cubic-bezier(.2,.7,.2,1)',
                    transformStyle: 'preserve-3d',
                }}
            >
                <div
                    className="text-[64px] md:text-[86px] font-extrabold tracking-[-0.02em] text-center animate-fadeUp"
                    style={{
                        backgroundImage: `conic-gradient(from 20deg at 50% 50%,
              ${C.indigo}, ${C.sky}, ${C.pink}, ${C.indigo})`,
                        backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        textShadow: `0 8px 30px ${C.sky}59`,
                        animation: 'gradientShift 4s ease-in-out infinite',
                    }}
                >
                    FLUXY
                </div>
                <div className="mt-6 flex gap-2 justify-center animate-fadeUp [animation-delay:.15s]">
                    <Dot c={C.indigo} delay="0ms" />
                    <Dot c={C.sky} delay="150ms" />
                    <Dot c={C.pink} delay="300ms" />
                </div>
            </div>

            {/* Tunnel d’entrée centré sur le mot */}
            <div
                ref={tunnelRef}
                className={`absolute inset-0 pointer-events-none ${phase === 'tunnel' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-150`}
                style={{
                    WebkitMaskImage:
                        phase === 'tunnel'
                            ? 'radial-gradient(circle at var(--cx,50%) var(--cy,50%), black 0%, black 40%, transparent 41%)'
                            : 'none',
                    maskImage:
                        phase === 'tunnel'
                            ? 'radial-gradient(circle at var(--cx,50%) var(--cy,50%), black 0%, black 40%, transparent 41%)'
                            : 'none',
                    animation: phase === 'tunnel' ? 'tunnelOpen 800ms cubic-bezier(.2,.7,.2,1) forwards' : undefined,
                    background: `radial-gradient(1200px 1200px at var(--cx,50%) var(--cy,50%),
                        ${C.glow}D9, ${C.sky}40, transparent 60%)`,
                }}
            />

            <style>{`
        @keyframes floatA { 0%{transform:translateY(0)} 50%{transform:translateY(10px)} 100%{transform:translateY(0)} }
        @keyframes floatB { 0%{transform:translateY(0)} 50%{transform:translateY(-12px)} 100%{transform:translateY(0)} }
        @keyframes fadeUp { 0%{opacity:0; transform: translateY(8px)} 100%{opacity:1; transform: translateY(0)} }
        @keyframes gradientShift { 0%{ background-position: 0% 50% } 50%{ background-position: 100% 50% } 100%{ background-position: 0% 50% } }
        @keyframes star { 0%{ opacity:0; transform: translateY(0) scale(.8)} 15%{opacity:.8} 100%{ opacity:0; transform: translateY(-32px) scale(1.1)} }
        @keyframes tunnelOpen { 0%{ -webkit-mask-size: 0px 0px; mask-size: 0px 0px; } 100%{ -webkit-mask-size: 400vmax 400vmax; mask-size: 400vmax 400vmax; } }

        .animate-fadeUp{ animation: fadeUp .45s ease-out both }

        @media (prefers-reduced-motion: reduce) {
          .animate-fadeUp { animation: none !important; }
        }
      `}</style>
        </div>
    );
}

function Dot({ c, delay }: { c: string; delay: string }) {
    return (
        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: c, animationDelay: delay }} />
    );
}

function StarField({ starColor }: { starColor: string }) {
    const nodes = Array.from({ length: 24 });
    return (
        <div className="absolute inset-0 pointer-events-none">
            {nodes.map((_, i) => (
                <span
                    key={i}
                    className="absolute w-1 h-1 rounded-full animate-[star_3s_ease-out_infinite]"
                    style={{
                        backgroundColor: starColor,
                        left: `${(i * 157) % 100}%`,
                        top: `${15 + ((i * 73) % 75)}%`,
                        animationDelay: `${i * 120}ms`,
                    }}
                />
            ))}
        </div>
    );
}
