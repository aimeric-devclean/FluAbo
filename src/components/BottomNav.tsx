import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  BarChart3,
  Calculator,
  Wallet,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Accueil' },
  { path: '/family', icon: Users, label: 'Famille' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/calculator', icon: Calculator, label: 'Calculette' },
  { path: '/budget', icon: Wallet, label: 'Budget' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl shadow-2xl" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-5 h-16">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-start justify-center pt-3
                  transition-all duration-300 active:scale-95
                  ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-slate-400'
                  }
                `}
              >
                <div className={`relative transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl blur-xl opacity-40 animate-pulse" style={{ animationDuration: '2s' }} />
                  )}
                  <div className={`relative p-2.5 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/30 dark:to-purple-500/30 shadow-lg'
                      : 'dark:hover:bg-slate-800/50'
                  }`}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
