import React, { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Tutorial: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('fluxy_tutorial_completed');
    if (hasSeenTutorial) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleComplete = () => {
    localStorage.setItem('fluxy_tutorial_completed', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDgsIDE2MywgMTg0LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

      <button
        onClick={handleComplete}
        className="absolute top-6 right-6 text-gray-600 dark:text-slate-400 dark:transition-colors z-50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-full p-2 border border-gray-200/30 dark:border-slate-700/30"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50 rounded-3xl p-10 shadow-2xl">
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                Prêt à gérer vos abonnements ?
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                Fluxy vous aide à suivre tous vos abonnements, à les partager en famille et à économiser de l'argent.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 py-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-2xl p-6 border border-blue-200/30 dark:border-blue-700/30">
                <div className="text-4xl mb-3">💳</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Gérez facilement</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Tous vos abonnements en un seul endroit</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 rounded-2xl p-6 border border-purple-200/30 dark:border-purple-700/30">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Partagez en famille</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Divisez les coûts automatiquement</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 dark:from-pink-500/20 dark:to-pink-600/20 rounded-2xl p-6 border border-pink-200/30 dark:border-pink-700/30">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Analysez vos dépenses</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Visualisez où va votre argent</p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <button
                onClick={handleComplete}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg flex items-center justify-center gap-2 text-lg"
              >
                Commencer à utiliser Fluxy
                <ArrowRight size={24} />
              </button>

              <p className="text-xs text-gray-500 dark:text-slate-500">
                Vous pouvez explorer l'app à votre rythme
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
