import React from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  // Hide on scroll down / show on scroll up
  const [hidden, setHidden] = React.useState(false);
  const [elevated, setElevated] = React.useState(false);
  const lastY = React.useRef(0);
  const ticking = React.useRef(false);

  React.useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY || 0;
          setElevated(y > 4);
          const delta = y - lastY.current;
          // seuil anti-jitter
          if (Math.abs(delta) > 6) {
            setHidden(delta > 0 && y > 24); // cache si on descend et pas tout en haut
            lastY.current = y;
          }
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-50',
        'backdrop-blur-2xl',
        'bg-white/55 dark:bg-slate-950/40',
        'transition-transform duration-300',
        hidden ? '-translate-y-full' : 'translate-y-0',
        elevated
          ? 'shadow-[0_8px_24px_rgba(24,24,27,0.18)] dark:shadow-[0_10px_28px_rgba(2,6,23,0.45)]'
          : 'shadow-none',
      ].join(' ')}
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
    >
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <h1
          className="text-2xl font-extrabold tracking-tight select-none
                     bg-gradient-to-r from-violet-600 to-blue-600
                     bg-clip-text text-transparent"
        >
          Fluxy
        </h1>

        <button
          onClick={() => navigate('/settings')}
          className="p-2 transition-all active:scale-95"
          aria-label="Paramètres"
        >
          <Settings size={22} strokeWidth={2.5} className="text-violet-600" />
        </button>
      </div>

      {/* fine separator pour une découpe propre (très discret) */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
    </header>
  );
};
