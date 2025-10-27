import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DynamicBackground } from '../components/DynamicBackground';
import { useStore } from '../store/useStore';

export const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { userName, setUserName } = useStore();
  const [tempName, setTempName] = useState(userName);

  const handleComplete = () => {
    if (!tempName.trim()) {
      return;
    }

    setUserName(tempName.trim());
    localStorage.setItem('fluxy_onboarding_completed', 'true');
    onComplete();
    navigate('/');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Bienvenue sur Fluxy !
              </h1>
              <p className="text-gray-600 dark:text-slate-400 text-base">
                Gérez vos abonnements et partagez-les facilement
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              Commencer
              <ArrowRight size={20} />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                Comment voulez-vous être appelé ?
              </h2>
              <p className="text-gray-600 dark:text-slate-400 text-xs">
                Entrez votre prénom ou pseudo
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="group relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-4 shadow-sm">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Votre prénom"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  autoFocus
                />
              </div>
            </div>

            <button
              onClick={handleComplete}
              disabled={!tempName.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Terminer
              <Check size={18} />
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full text-gray-600 dark:text-slate-400 dark:transition-colors text-xs font-medium py-1"
            >
              Retour
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <DynamicBackground />
      <div className="min-h-screen h-screen flex items-center justify-center px-4 py-4 overflow-hidden">
        <div className="w-full max-w-md max-h-[95vh] flex flex-col">
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-3xl p-5 shadow-2xl">
            <div className="flex gap-2 mb-4">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                    s <= step
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                      : 'bg-gray-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
            {renderStep()}
          </div>
        </div>
      </div>
    </>
  );
};
