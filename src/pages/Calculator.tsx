import React, { useState } from 'react';
import { Calculator as CalcIcon } from 'lucide-react';
import { Header } from '../components/Header';
import { BillingCycle } from '../types';
import { toMonthlyEquivalent, toAnnualEquivalent, toWeeklyEquivalent } from '../utils/calculations';
import { useStore } from '../store/useStore';
import { getCurrencySymbol } from '../utils/currency';
import { DynamicBackground } from '../components/DynamicBackground';

export const Calculator: React.FC = () => {
  const { currency } = useStore();
  const [price, setPrice] = useState('');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  const numPrice = parseFloat(price) || 0;

  const monthly = toMonthlyEquivalent(numPrice, cycle);
  const annual = toAnnualEquivalent(numPrice, cycle);
  const weekly = toWeeklyEquivalent(numPrice, cycle);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-pink-50/20 dark:from-gray-950 dark:via-violet-950/10 dark:to-pink-950/10">
        <div className="px-4 pt-20 pb-28 max-w-2xl mx-auto animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Calculette
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Convertissez vos abonnements
              </p>
            </div>
          </div>

      <div className="relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-4 shadow-sm">
        <div className="relative z-10 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Montant
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="0.00"
                className="w-full px-4 py-3 text-xl font-bold rounded-xl border border-gray-200/50 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all backdrop-blur-xl"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-500 dark:text-slate-400">{getCurrencySymbol(currency)}</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Périodicité
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: 'weekly' as BillingCycle, label: 'Semaine', short: 'Sem.' },
                { value: 'monthly' as BillingCycle, label: 'Mois', short: 'Mois' },
                { value: 'annual' as BillingCycle, label: 'Année', short: 'An' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCycle(option.value)}
                  className={`px-3 py-2 rounded-xl font-bold transition-all duration-200 text-xs active:scale-95 ${
                      cycle === option.value
                        ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md'
                        : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 dark:backdrop-blur'
                    }`}
                >
                  <div className="hidden sm:block">{option.label}</div>
                  <div className="sm:hidden">{option.short}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200/30 dark:border-slate-700/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 flex items-center justify-center">
                <CalcIcon className="w-4 h-4 text-violet-600" strokeWidth={2} />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Équivalences
              </h3>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30">
                <span className="font-semibold text-gray-700 dark:text-slate-300 text-xs">
                  Hebdomadaire
                </span>
                <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-blue-600 dark:from-blue-400 dark:to-blue-400 bg-clip-text text-transparent">
                  {weekly.toFixed(2)} {getCurrencySymbol(currency)}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30">
                <span className="font-semibold text-gray-700 dark:text-slate-300 text-xs">
                  Mensuel
                </span>
                <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-blue-600 dark:from-blue-400 dark:to-blue-400 bg-clip-text text-transparent">
                  {monthly.toFixed(2)} {getCurrencySymbol(currency)}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30">
                <span className="font-semibold text-gray-700 dark:text-slate-300 text-xs">
                  Annuel
                </span>
                <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-blue-600 dark:from-blue-400 dark:to-blue-400 bg-clip-text text-transparent">
                  {annual.toFixed(2)} {getCurrencySymbol(currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </>
  );
};
