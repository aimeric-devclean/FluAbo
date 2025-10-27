import React, { useState, useEffect } from 'react';
import { Moon, Sun, Bell, BellOff, RefreshCw, ArrowUpDown, Monitor } from 'lucide-react';
import { Header } from '../components/Header';
import { useStore } from '../store/useStore';
import { currencies } from '../utils/currency';
import { requestNotificationPermission, sendTestNotification, checkUpcomingPayments } from '../utils/notifications';
import { APP_VERSION } from '../version';

export const Settings: React.FC = () => {
  const { userName, theme, setTheme, currency, setCurrency, notifications, toggleNotifications, autoRenew, toggleAutoRenew, sortBy, setSortBy, resetData, members, subscriptions } = useStore();
  const [myMemberId, setMyMemberId] = useState<string>('');


  useEffect(() => {
    if (userName && members.length > 0) {
      const member = members.find(m => m.name === userName);
      if (member) {
        setMyMemberId(member.id);
      }
    }
  }, [userName, members]);


  const handleToggleNotifications = async () => {
    if (!notifications) {
      const granted = await requestNotificationPermission();
      if (granted) {
        toggleNotifications();
        sendTestNotification();
        if (userName && myMemberId) {
          checkUpcomingPayments(subscriptions, members, myMemberId, userName);
        }
      } else {
        alert('Vous devez autoriser les notifications dans les paramètres de votre navigateur');
      }
    } else {
      toggleNotifications();
    }
  };

  const handleReset = () => {
    if (confirm('Voulez-vous vraiment supprimer toutes vos données ?')) {
      resetData();
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-pink-50/20 dark:from-gray-950 dark:via-violet-950/10 dark:to-pink-950/10">
        <div className="px-4 pt-20 pb-28 max-w-2xl mx-auto animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Paramètres
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Personnalisez votre expérience
              </p>
            </div>
          </div>

      <div className="space-y-2">

        <div className="group relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-4 shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/15 to-pink-500/15 dark:from-purple-500/25 dark:to-pink-500/25 flex items-center justify-center">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400" strokeWidth={2} /> : theme === 'light' ? <Sun className="w-4 h-4 text-purple-600 dark:text-purple-400" strokeWidth={2} /> : <Monitor className="w-4 h-4 text-purple-600 dark:text-purple-400" strokeWidth={2} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Thème</h3>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  {theme === 'dark' ? 'Mode sombre' : theme === 'light' ? 'Mode clair' : 'Système'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`px-3 py-2 rounded-lg font-bold transition-all duration-200 text-xs flex items-center justify-center gap-1.5 active:scale-95 ${
                  theme === 'light'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <Sun size={14} />
                Clair
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-3 py-2 rounded-lg font-bold transition-all duration-200 text-xs flex items-center justify-center gap-1.5 active:scale-95 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <Moon size={14} />
                Sombre
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`px-3 py-2 rounded-lg font-bold transition-all duration-200 text-xs flex items-center justify-center gap-1.5 active:scale-95 ${
                  theme === 'system'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <Monitor size={14} />
                Auto
              </button>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-4 shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/15 to-purple-500/15 dark:from-blue-500/25 dark:to-purple-500/25 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-base font-bold">{currencies.find(c => c.code === currency)?.symbol || '€'}</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Devise</h3>
                <p className="text-xs text-gray-600 dark:text-slate-400">Monnaie</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => setCurrency(curr.code)}
                  className={`px-3 py-2 rounded-lg font-bold transition-all duration-200 text-xs flex items-center justify-center gap-1.5 active:scale-95 ${
                    currency === curr.code
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="text-sm">{curr.symbol}</span>
                  <span>{curr.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-4 shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-blue-500/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-500/15 dark:from-blue-500/25 dark:to-blue-500/25 flex items-center justify-center">
                {notifications ? <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2} /> : <BellOff className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
                <p className="text-xs text-gray-600 dark:text-slate-400">Rappels</p>
              </div>
            </div>
            <button
              onClick={handleToggleNotifications}
              className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                notifications ? 'bg-gradient-to-r from-blue-500 to-blue-500' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-md ${
                  notifications ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-4 shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-blue-500/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/15 to-blue-500/15 dark:from-purple-500/25 dark:to-blue-500/25 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-purple-600 dark:text-purple-400" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Renouvellement auto</h3>
                <p className="text-xs text-gray-600 dark:text-slate-400">Dates</p>
              </div>
            </div>
            <button
              onClick={toggleAutoRenew}
              className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                autoRenew ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-md ${
                  autoRenew ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-4 shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/15 to-purple-500/15 dark:from-blue-500/25 dark:to-purple-500/25 flex items-center justify-center">
                <ArrowUpDown className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Tri des abonnements</h3>
                <p className="text-xs text-gray-600 dark:text-slate-400">Ordre</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'name' as const, label: 'Nom' },
                { value: 'price' as const, label: 'Prix' },
                { value: 'nextCharge' as const, label: 'Date' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-3 py-2 rounded-lg font-bold transition-all duration-200 text-xs active:scale-95 ${
                    sortBy === option.value
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>


        <button
          onClick={handleReset}
          className="w-full px-4 py-3 bg-white/40 dark:bg-slate-800/40 dark:border border-gray-200/30 dark:border-slate-700/30 rounded-xl text-red-600 dark:text-red-400 dark:font-bold transition-all duration-200 shadow-sm active:scale-[0.98] backdrop-blur-xl text-sm"
        >
          Réinitialiser toutes les données
        </button>

        <div className="text-center text-xs text-gray-500 dark:text-slate-500 pt-2">
          <p>Fluxy v{APP_VERSION}</p>
        </div>
      </div>
        </div>
      </div>
    </>
  );
};
